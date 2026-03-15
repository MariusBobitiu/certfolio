import { hash } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import { config } from "dotenv"
import { pathToFileURL } from "node:url"
import { client, db, ProjectsTable, UsersTable } from "./drizzle"

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
    project_type: "Software",
    role: "Product engineer",
    status: "published" as const,
  },
  {
    slug: "homelab-zero-touch-deployments",
    title: "Homelab Zero-Touch Deployments",
    summary:
      "Built an infrastructure automation workflow for repeatable homelab provisioning, covering base configuration, service rollout, and ongoing maintenance tasks.",
    project_type: "Infrastructure",
    role: "Systems engineer",
    status: "published" as const,
  },
  {
    slug: "soc-lab-incident-playbooks",
    title: "SOC Lab Incident Playbooks",
    summary:
      "Created a security lab project focused on documenting response playbooks for common alert patterns, with an emphasis on clarity, triage speed, and repeatability.",
    project_type: "Security",
    role: "Security analyst",
    status: "draft" as const,
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
        continue
      }

      await db.insert(ProjectsTable).values({
        user_id: adminId,
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        project_type: project.project_type,
        role: project.role,
        status: project.status,
      })
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
