import { hash } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import { config } from "dotenv"
import { pathToFileURL } from "node:url"
import {
  client,
  db,
  ProjectEvidenceLinksTable,
  ProjectsTable,
  UsersTable,
} from "./drizzle"

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local", quiet: true })

const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? "admin@demo.com"
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? "test1234"
const ADMIN_NAME = process.env.DEMO_ADMIN_NAME ?? "Admin"
const ADMIN_SLUG = process.env.DEMO_ADMIN_SLUG ?? "admin"
const ADMIN_IMAGE =
  process.env.DEMO_ADMIN_IMAGE ??
  "https://api.dicebear.com/9.x/initials/svg?seed=Admin"

type SeedOptions = {
  closeConnection?: boolean
}

const demoProjects = [
  {
    slug: "certification-ops-dashboard",
    title: "Certification Ops Dashboard",
    summary:
      "Designed and implemented an internal dashboard that reduced time spent tracking certification renewals and surfaced overdue renewals earlier for the team.",
    context:
      "The team was tracking renewals manually across scattered spreadsheets and inbox reminders, which made overdue items hard to spot early.",
    outcome:
      "Created a single operational view that made renewal risk visible earlier and reduced recurring admin overhead for the team.",
    tools: "Next.js, PostgreSQL, Drizzle, Tailwind CSS",
    project_type: "Software",
    role: "Product engineer",
    status: "published" as const,
    evidenceLinks: [
      {
        label: "Source repository",
        url: "https://github.com/demo/certification-ops-dashboard",
        kind: "repository" as const,
      },
      {
        label: "Internal rollout notes",
        url: "https://docs.example.com/certification-ops-dashboard",
        kind: "documentation" as const,
      },
    ],
  },
  {
    slug: "homelab-zero-touch-deployments",
    title: "Homelab Zero-Touch Deployments",
    summary:
      "Built an infrastructure automation workflow for repeatable homelab provisioning, covering base configuration, service rollout, and ongoing maintenance tasks.",
    context:
      "Provisioning and rebuilding homelab environments repeatedly was inconsistent and time-consuming, especially when testing service changes.",
    outcome:
      "Reduced rebuild friction and made infrastructure changes more repeatable, which improved confidence when iterating on services.",
    tools: "Terraform, Ansible, Docker, Linux",
    project_type: "Infrastructure",
    role: "Systems engineer",
    status: "published" as const,
    evidenceLinks: [
      {
        label: "Automation repository",
        url: "https://github.com/demo/homelab-zero-touch",
        kind: "repository" as const,
      },
      {
        label: "Provisioning write-up",
        url: "https://blog.example.com/homelab-zero-touch",
        kind: "write_up" as const,
      },
    ],
  },
  {
    slug: "soc-lab-incident-playbooks",
    title: "SOC Lab Incident Playbooks",
    summary:
      "Created a security lab project focused on documenting response playbooks for common alert patterns, with an emphasis on clarity, triage speed, and repeatability.",
    context:
      "Repeated alert investigations were producing inconsistent response quality because there was no clear shared playbook for common patterns.",
    outcome:
      "Produced clearer incident response guidance that improved repeatability and gave junior analysts a stronger starting point during triage.",
    tools: "Wazuh, Elastic, Markdown, Kali Linux",
    project_type: "Security",
    role: "Security analyst",
    status: "draft" as const,
    evidenceLinks: [
      {
        label: "Playbook repository",
        url: "https://github.com/demo/soc-lab-playbooks",
        kind: "repository" as const,
      },
      {
        label: "Lab walkthrough",
        url: "https://blog.example.com/soc-lab-playbooks",
        kind: "case_study" as const,
      },
    ],
  },
] as const

export async function seedDatabase(options: SeedOptions = {}) {
  const { closeConnection = false } = options

  try {
    const [existingAdmin] = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(eq(UsersTable.email, ADMIN_EMAIL))
      .limit(1)

    let adminId = existingAdmin?.id

    if (!adminId) {
      const passwordHash = await hash(ADMIN_PASSWORD)

      const [adminUser] = await db
        .insert(UsersTable)
        .values({
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          image: ADMIN_IMAGE,
          slug: ADMIN_SLUG,
          password_hash: passwordHash,
          email_verified_at: new Date(),
        })
        .returning({ id: UsersTable.id })

      adminId = adminUser.id
      console.log(`✓ Admin user created: ${ADMIN_EMAIL}`)
    } else {
      console.log("✓ Admin user already exists")
    }

    for (const project of demoProjects) {
      const [existingProject] = await db
        .select({ id: ProjectsTable.id })
        .from(ProjectsTable)
        .where(eq(ProjectsTable.slug, project.slug))
        .limit(1)

      if (existingProject) {
        await db
          .update(ProjectsTable)
          .set({
            title: project.title,
            summary: project.summary,
            context: project.context,
            outcome: project.outcome,
            tools: project.tools,
            project_type: project.project_type,
            role: project.role,
            status: project.status,
          })
          .where(eq(ProjectsTable.id, existingProject.id))

        await db
          .delete(ProjectEvidenceLinksTable)
          .where(eq(ProjectEvidenceLinksTable.project_id, existingProject.id))

        if (project.evidenceLinks.length > 0) {
          await db.insert(ProjectEvidenceLinksTable).values(
            project.evidenceLinks.map((evidenceLink, index) => ({
              project_id: existingProject.id,
              label: evidenceLink.label,
              url: evidenceLink.url,
              kind: evidenceLink.kind,
              sort_order: index,
            }))
          )
        }
        continue
      }

      const [insertedProject] = await db.insert(ProjectsTable).values({
        user_id: adminId,
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        context: project.context,
        outcome: project.outcome,
        tools: project.tools,
        project_type: project.project_type,
        role: project.role,
        status: project.status,
      }).returning({ id: ProjectsTable.id })

      if (project.evidenceLinks.length > 0) {
        await db.insert(ProjectEvidenceLinksTable).values(
          project.evidenceLinks.map((evidenceLink, index) => ({
            project_id: insertedProject.id,
            label: evidenceLink.label,
            url: evidenceLink.url,
            kind: evidenceLink.kind,
            sort_order: index,
          }))
        )
      }
    }

    console.log("✓ Demo admin projects seeded")
    console.log("✓ Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  } finally {
    if (closeConnection) {
      await client.end()
    }
  }
}

async function runSeedCli() {
  await seedDatabase({ closeConnection: true })
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isMain) {
  runSeedCli()
    .then(() => {
      process.exitCode = 0
    })
    .catch(() => {
      process.exitCode = 1
    })
}
