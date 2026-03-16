import { hash } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import { config } from "dotenv"
import { pathToFileURL } from "node:url"
import {
  normalizeIssuerAliases,
  normalizeIssuerName,
} from "./credentials/issuer-normalization"
import {
  client,
  IssuersTable,
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

const seededIssuers = [
  {
    slug: "amazon-web-services",
    display_name: "Amazon Web Services",
    normalized_name: normalizeIssuerName("Amazon Web Services"),
    aliases: normalizeIssuerAliases(["AWS", "Amazon", "Amazon Web Services, Inc.", "Amazon Web Services", "Amazon Web Services - AWS", "Amazon Web Services (AWS)", "AWS (Amazon Web Services)", "amazon web services"]),
    website_url: "https://aws.amazon.com",
    logo_url: "",
    theme_key: "aws",
  },
  {
    slug: "comptia",
    display_name: "CompTIA",
    normalized_name: normalizeIssuerName("CompTIA"),
    aliases: normalizeIssuerAliases(["CompTIA", "Computing Technology Industry Association", "CompTIA, Inc.", "CompTIA International", "CompTIA - Computing Technology Industry Association", "CompTIA (Computing Technology Industry Association)", "comptia"]),
    website_url: "https://www.comptia.org",
    logo_url: "",
    theme_key: "comptia",
  },
  {
    slug: "microsoft",
    display_name: "Microsoft",
    normalized_name: normalizeIssuerName("Microsoft"),
    aliases: normalizeIssuerAliases(["MSFT", "Microsoft Learn", "Microsoft Corporation", "Microsoft Corporation - MSFT", "Microsoft Corporation (MSFT)", "Microsoft Learn", "microsoft"]),
    website_url: "https://learn.microsoft.com",
    logo_url: "",
    theme_key: "microsoft",
  },
  {
    slug: "google-cloud",
    display_name: "Google Cloud",
    normalized_name: normalizeIssuerName("Google Cloud"),
    aliases: normalizeIssuerAliases(["GCP", "Google Cloud Platform", "Google Cloud Services", "google cloud"]),
    website_url: "https://cloud.google.com",
    logo_url: "",
    theme_key: "google-cloud",
  },
  {
    slug: "cisco",
    display_name: "Cisco",
    normalized_name: normalizeIssuerName("Cisco"),
    aliases: normalizeIssuerAliases(["Cisco Networking Academy", "Cisco Systems", "Cisco Systems, Inc.", "cisco"]),
    website_url: "https://www.cisco.com",
    logo_url: "",
    theme_key: "cisco",
  },
  {
    slug: "isc2",
    display_name: "(ISC)2",
    normalized_name: normalizeIssuerName("(ISC)2"),
    aliases: normalizeIssuerAliases(["ISC2", "ISC Squared", "International Information System Security Certification Consortium", "ISC2 - International Information System Security Certification Consortium", "ISC2 (International Information System Security Certification Consortium)", "isc2"]),
    website_url: "https://www.isc2.org",
    logo_url: "",
    theme_key: "isc2",
  },
  {
    slug: "offensive-security",
    display_name: "Offensive Security",
    normalized_name: normalizeIssuerName("Offensive Security"),
    aliases: normalizeIssuerAliases(["OffSec", "Offensive Security, Inc.", "Offensive Security Limited", "Offensive Security - OffSec", "Offensive Security (OffSec)", "offensive security"]),
    website_url: "https://www.offensive-security.com",
    logo_url: "",
    theme_key: "offensive-security",
  },
  {
    slug: "red-hat",
    display_name: "Red Hat",
    normalized_name: normalizeIssuerName("Red Hat"),
    aliases: normalizeIssuerAliases(["RedHat", "Red Hat, Inc.", "Red Hat Software", "Red Hat - RedHat", "Red Hat (RedHat)", "red hat"]),
    website_url: "https://www.redhat.com",
    logo_url: "",
    theme_key: "red-hat",
  },
  {
    slug: "linux-foundation",
    display_name: "Linux Foundation",
    normalized_name: normalizeIssuerName("Linux Foundation"),
    aliases: normalizeIssuerAliases(["Linux Foundation, Inc.", "The Linux Foundation", "Linux Foundation - The Linux Foundation", "Linux Foundation (The Linux Foundation)", "linux foundation"]),
    website_url: "https://www.linuxfoundation.org",
    logo_url: "",
    theme_key: "linux-foundation",
  },
  {
    slug: "pmi",
    display_name: "Project Management Institute",
    normalized_name: normalizeIssuerName("Project Management Institute"),
    aliases: normalizeIssuerAliases(["PMI", "Project Management Institute, Inc.", "Project Management Institute - PMI", "Project Management Institute (PMI)", "project management institute"]),
    website_url: "https://www.pmi.org",
    logo_url: "",
    theme_key: "pmi",
  },
  {
    slug: "tryhackme",
    display_name: "TryHackMe",
    normalized_name: normalizeIssuerName("TryHackMe"),
    aliases: normalizeIssuerAliases(["Try Hack Me", "TryHackMe Limited", "TryHackMe - Try Hack Me", "TryHackMe (Try Hack Me)", "tryhackme"]),
    website_url: "https://tryhackme.com",
    logo_url: "",
    theme_key: "tryhackme",
  },
  {
    slug: "ec-council",
    display_name: "EC-Council",
    normalized_name: normalizeIssuerName("EC-Council"),
    aliases: normalizeIssuerAliases(["EC-Council", "International Council of E-Commerce Consultants", "EC-Council - International Council of E-Commerce Consultants", "EC-Council (International Council of E-Commerce Consultants)", "ec-council"]),
    website_url: "https://www.eccouncil.org",
    logo_url: "",
    theme_key: "ec-council",
  },
  {
    slug: "vmware",
    display_name: "VMware",
    normalized_name: normalizeIssuerName("VMware"),
    aliases: normalizeIssuerAliases(["VMware, Inc.", "VMware, Inc.", "VMware - VMware, Inc.", "VMware (VMware, Inc.)", "vmware"]),
    website_url: "https://www.vmware.com",
    logo_url: "",
    theme_key: "vmware",
  },
  {
    slug: "oracle",
    display_name: "Oracle",
    normalized_name: normalizeIssuerName("Oracle"),
    aliases: normalizeIssuerAliases(["Oracle Corporation", "Oracle Corporation - Oracle", "Oracle Corporation (Oracle)", "oracle"]),
    website_url: "https://www.oracle.com",
    logo_url: "",
    theme_key: "oracle",
  },
  {
    slug: "salesforce",
    display_name: "Salesforce",
    normalized_name: normalizeIssuerName("Salesforce"),
    aliases: normalizeIssuerAliases(["Salesforce.com", "Salesforce, Inc.", "Salesforce - Salesforce.com", "Salesforce (Salesforce.com)", "salesforce"]),
    website_url: "https://www.salesforce.com",
    logo_url: "",
    theme_key: "salesforce",
  },
  {
    slug: "ibm",
    display_name: "IBM",
    normalized_name: normalizeIssuerName("IBM"),
    aliases: normalizeIssuerAliases(["International Business Machines", "IBM Corporation", "IBM - International Business Machines", "IBM (International Business Machines)", "ibm"]),
    website_url: "https://www.ibm.com",
    logo_url: "",
    theme_key: "ibm",
  },
  {
    slug: "pearson-vue",
    display_name: "Pearson VUE",
    normalized_name: normalizeIssuerName("Pearson VUE"),
    aliases: normalizeIssuerAliases(["Pearson", "Pearson VUE, Inc.", "Pearson VUE - Pearson", "Pearson VUE (Pearson)", "pearson vue"]),
    website_url: "https://home.pearsonvue.com",
    logo_url: "",
    theme_key: "pearson-vue",
  },
  {
    slug: "tcm-sec",
    display_name: "TCM Security",
    normalized_name: normalizeIssuerName("TCM Security"),
    aliases: normalizeIssuerAliases(["TCM", "TCM Security, Inc.", "TCM Security - TCM", "TCM Security (TCM)", "tcm security"]),
    website_url: "https://www.tcm-sec.com",
    logo_url: "",
    theme_key: "tcm-security",
  }
] as const

export async function seedDatabase(options: SeedOptions = {}) {
  const { closeConnection = false } = options

  try {
    for (const issuer of seededIssuers) {
      const [existingIssuer] = await db
        .select({ id: IssuersTable.id })
        .from(IssuersTable)
        .where(eq(IssuersTable.slug, issuer.slug))
        .limit(1)

      if (existingIssuer) {
        await db
          .update(IssuersTable)
          .set({
            display_name: issuer.display_name,
            normalized_name: issuer.normalized_name,
            aliases: issuer.aliases,
            kind: "seeded",
            website_url: issuer.website_url,
            logo_url: issuer.logo_url,
            theme_key: issuer.theme_key,
            created_by_user_id: null,
            updated_at: new Date(),
          })
          .where(eq(IssuersTable.id, existingIssuer.id))
        continue
      }

      await db.insert(IssuersTable).values({
        slug: issuer.slug,
        display_name: issuer.display_name,
        normalized_name: issuer.normalized_name,
        aliases: issuer.aliases,
        kind: "seeded",
        website_url: issuer.website_url,
        logo_url: issuer.logo_url,
        theme_key: issuer.theme_key,
        created_by_user_id: null,
      })
    }

    console.log("✓ Seed issuers ready")

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
