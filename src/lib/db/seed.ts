import { hash } from "@node-rs/argon2"
import { and, eq } from "drizzle-orm"
import { config } from "dotenv"
import { pathToFileURL } from "node:url"
import {
  normalizeIssuerAliases,
  normalizeIssuerName,
} from "./credentials/issuer-normalization"
import {
  client,
  CredentialsTable,
  IssuersTable,
  UserLinksTable,
  UserPreferencesTable,
  db,
  ProjectEvidenceLinksTable,
  ProjectsTable,
  SkillsTable,
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

const demoCredentials = [
  {
    slug: "aws-solutions-architect-associate",
    title: "AWS Certified Solutions Architect - Associate",
    issuerSlug: "amazon-web-services",
    source_type: "credly" as const,
    verification_status: "verified_external" as const,
    credential_code: "AWS-SAA-2026-DEMO",
    verification_url:
      "https://www.credly.com/badges/demo-aws-solutions-architect",
    certificate_asset_key: "",
    issued_on: new Date("2025-05-01T00:00:00.000Z"),
    expires_on: new Date("2028-05-01T00:00:00.000Z"),
    summary:
      "Validates practical AWS architecture knowledge across secure, resilient, and cost-aware cloud solution design.",
    status: "published" as const,
  },
  {
    slug: "comptia-security-plus",
    title: "CompTIA Security+",
    issuerSlug: "comptia",
    source_type: "issuer_link" as const,
    verification_status: "linked_external" as const,
    credential_code: "SECPLUS-DEMO-601",
    verification_url: "https://www.comptia.org/certifications/security",
    certificate_asset_key: "",
    issued_on: new Date("2024-10-01T00:00:00.000Z"),
    expires_on: new Date("2027-10-01T00:00:00.000Z"),
    summary:
      "Shows baseline security operations, risk, and defensive practice knowledge suitable for hands-on infrastructure and security work.",
    status: "published" as const,
  },
  {
    slug: "azure-fundamentals",
    title: "Microsoft Certified: Azure Fundamentals",
    issuerSlug: "microsoft",
    source_type: "manual" as const,
    verification_status: "self_declared" as const,
    credential_code: "AZ-900-DEMO",
    verification_url: "",
    certificate_asset_key: "",
    issued_on: new Date("2023-09-01T00:00:00.000Z"),
    expires_on: null,
    summary:
      "Covers core Azure concepts, cloud service models, pricing fundamentals, and identity/security basics.",
    status: "draft" as const,
  },
] as const

const demoSkills = [
  { name: "TypeScript", category: "technical" },
  { name: "Next.js", category: "tools" },
  { name: "PostgreSQL", category: "tools" },
  { name: "Cloud architecture", category: "domain" },
  { name: "Security operations", category: "domain" },
  { name: "Technical leadership", category: "professional" },
] as const

const seededIssuers = [
  {
    slug: "amazon-web-services",
    display_name: "Amazon Web Services",
    normalized_name: normalizeIssuerName("Amazon Web Services"),
    aliases: normalizeIssuerAliases([
      "AWS",
      "Amazon Web Services",
      "Amazon Web Services AWS",
    ]),
    website_url: "https://aws.amazon.com",
    logo_url: "",
    theme_key: "aws",
  },
  {
    slug: "comptia",
    display_name: "CompTIA",
    normalized_name: normalizeIssuerName("CompTIA"),
    aliases: normalizeIssuerAliases([
      "CompTIA",
      "Computing Technology Industry Association",
    ]),
    website_url: "https://www.comptia.org",
    logo_url: "",
    theme_key: "comptia",
  },
  {
    slug: "microsoft",
    display_name: "Microsoft",
    normalized_name: normalizeIssuerName("Microsoft"),
    aliases: normalizeIssuerAliases([
      "MSFT",
      "Microsoft Learn",
      "Microsoft Corporation",
    ]),
    website_url: "https://learn.microsoft.com",
    logo_url: "",
    theme_key: "microsoft",
  },
  {
    slug: "google-cloud",
    display_name: "Google Cloud",
    normalized_name: normalizeIssuerName("Google Cloud"),
    aliases: normalizeIssuerAliases([
      "GCP",
      "Google Cloud Platform",
      "Google Cloud",
    ]),
    website_url: "https://cloud.google.com",
    logo_url: "",
    theme_key: "google-cloud",
  },
  {
    slug: "cisco",
    display_name: "Cisco",
    normalized_name: normalizeIssuerName("Cisco"),
    aliases: normalizeIssuerAliases([
      "Cisco",
      "Cisco Systems",
      "Cisco Networking Academy",
    ]),
    website_url: "https://www.cisco.com",
    logo_url: "",
    theme_key: "cisco",
  },
  {
    slug: "isc2",
    display_name: "(ISC)2",
    normalized_name: normalizeIssuerName("(ISC)2"),
    aliases: normalizeIssuerAliases([
      "ISC2",
      "ISC Squared",
      "International Information System Security Certification Consortium",
    ]),
    website_url: "https://www.isc2.org",
    logo_url: "",
    theme_key: "isc2",
  },
  {
    slug: "offensive-security",
    display_name: "Offensive Security",
    normalized_name: normalizeIssuerName("Offensive Security"),
    aliases: normalizeIssuerAliases([
      "OffSec",
      "Offensive Security",
      "Offensive Security Limited",
    ]),
    website_url: "https://www.offensive-security.com",
    logo_url: "",
    theme_key: "offensive-security",
  },
  {
    slug: "red-hat",
    display_name: "Red Hat",
    normalized_name: normalizeIssuerName("Red Hat"),
    aliases: normalizeIssuerAliases(["Red Hat", "RedHat", "Red Hat Software"]),
    website_url: "https://www.redhat.com",
    logo_url: "",
    theme_key: "red-hat",
  },
  {
    slug: "linux-foundation",
    display_name: "Linux Foundation",
    normalized_name: normalizeIssuerName("Linux Foundation"),
    aliases: normalizeIssuerAliases([
      "Linux Foundation",
      "The Linux Foundation",
      "Linux Foundation Inc",
    ]),
    website_url: "https://www.linuxfoundation.org",
    logo_url: "",
    theme_key: "linux-foundation",
  },
  {
    slug: "pmi",
    display_name: "Project Management Institute",
    normalized_name: normalizeIssuerName("Project Management Institute"),
    aliases: normalizeIssuerAliases([
      "PMI",
      "Project Management Institute",
      "Project Management Institute Inc",
    ]),
    website_url: "https://www.pmi.org",
    logo_url: "",
    theme_key: "pmi",
  },
  {
    slug: "tryhackme",
    display_name: "TryHackMe",
    normalized_name: normalizeIssuerName("TryHackMe"),
    aliases: normalizeIssuerAliases([
      "TryHackMe",
      "Try Hack Me",
      "TryHackMe Limited",
    ]),
    website_url: "https://tryhackme.com",
    logo_url: "",
    theme_key: "tryhackme",
  },
  {
    slug: "ec-council",
    display_name: "EC-Council",
    normalized_name: normalizeIssuerName("EC-Council"),
    aliases: normalizeIssuerAliases([
      "EC-Council",
      "EC Council",
      "International Council of E Commerce Consultants",
    ]),
    website_url: "https://www.eccouncil.org",
    logo_url: "",
    theme_key: "ec-council",
  },
  {
    slug: "vmware",
    display_name: "VMware",
    normalized_name: normalizeIssuerName("VMware"),
    aliases: normalizeIssuerAliases([
      "VMware",
      "VMware Inc",
      "VMware by Broadcom",
    ]),
    website_url: "https://www.vmware.com",
    logo_url: "",
    theme_key: "vmware",
  },
  {
    slug: "oracle",
    display_name: "Oracle",
    normalized_name: normalizeIssuerName("Oracle"),
    aliases: normalizeIssuerAliases(["Oracle", "Oracle Corporation"]),
    website_url: "https://www.oracle.com",
    logo_url: "",
    theme_key: "oracle",
  },
  {
    slug: "salesforce",
    display_name: "Salesforce",
    normalized_name: normalizeIssuerName("Salesforce"),
    aliases: normalizeIssuerAliases([
      "Salesforce",
      "Salesforce.com",
      "Salesforce Inc",
    ]),
    website_url: "https://www.salesforce.com",
    logo_url: "",
    theme_key: "salesforce",
  },
  {
    slug: "ibm",
    display_name: "IBM",
    normalized_name: normalizeIssuerName("IBM"),
    aliases: normalizeIssuerAliases([
      "IBM",
      "International Business Machines",
      "IBM Corporation",
    ]),
    website_url: "https://www.ibm.com",
    logo_url: "",
    theme_key: "ibm",
  },
  {
    slug: "pearson-vue",
    display_name: "Pearson VUE",
    normalized_name: normalizeIssuerName("Pearson VUE"),
    aliases: normalizeIssuerAliases(["Pearson VUE", "PearsonVue", "Pearson"]),
    website_url: "https://home.pearsonvue.com",
    logo_url: "",
    theme_key: "pearson-vue",
  },
  {
    slug: "tcm-sec",
    display_name: "TCM Security",
    normalized_name: normalizeIssuerName("TCM Security"),
    aliases: normalizeIssuerAliases([
      "TCM",
      "TCM Security",
      "TCM Security Inc",
    ]),
    website_url: "https://www.tcm-sec.com",
    logo_url: "",
    theme_key: "tcm-security",
  },
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

    const issuerRows = await db
      .select({ id: IssuersTable.id, slug: IssuersTable.slug })
      .from(IssuersTable)

    const issuerIdBySlug = new Map(
      issuerRows.map((issuer) => [issuer.slug, issuer.id])
    )

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

    // Seed preferences
    const [existingPrefs] = await db
      .select({ id: UserPreferencesTable.id })
      .from(UserPreferencesTable)
      .where(eq(UserPreferencesTable.user_id, adminId))
      .limit(1)

    if (!existingPrefs) {
      await db.insert(UserPreferencesTable).values({
        user_id: adminId,
        accent_colour: "#3b82f6",
        headline: "Engineering leader & full-stack developer",
        bio: "Building tools that help professionals own their credentials. Previously led platform engineering at multiple startups. Passionate about verification, trust, and developer experience.",
        public_profile: true,
        featured_credential_ids: [],
        featured_project_ids: [],
      })
      console.log("✓ Admin preferences seeded")
    } else {
      await db
        .update(UserPreferencesTable)
        .set({
          accent_colour: "#3b82f6",
          headline: "Engineering leader & full-stack developer",
          bio: "Building tools that help professionals own their credentials. Previously led platform engineering at multiple startups. Passionate about verification, trust, and developer experience.",
          public_profile: true,
        })
        .where(eq(UserPreferencesTable.user_id, adminId))
      console.log("✓ Admin preferences updated")
    }

    // Seed demo links
    const [existingLink] = await db
      .select({ id: UserLinksTable.id })
      .from(UserLinksTable)
      .where(eq(UserLinksTable.user_id, adminId))
      .limit(1)

    if (!existingLink) {
      await db.insert(UserLinksTable).values([
        {
          user_id: adminId,
          platform: "website",
          label: "Website",
          url: "https://admin.dev",
          sort_order: 0,
        },
        {
          user_id: adminId,
          platform: "github",
          label: "GitHub",
          url: "https://github.com/admin",
          sort_order: 1,
        },
        {
          user_id: adminId,
          platform: "linkedin",
          label: "LinkedIn",
          url: "https://linkedin.com/in/admin",
          sort_order: 2,
        },
      ])
      console.log("✓ Admin demo links seeded")
    } else {
      // Update existing demo links to add platform column
      await db
        .update(UserLinksTable)
        .set({ platform: "website" })
        .where(
          and(
            eq(UserLinksTable.user_id, adminId),
            eq(UserLinksTable.label, "Website")
          )
        )
      await db
        .update(UserLinksTable)
        .set({ platform: "github" })
        .where(
          and(
            eq(UserLinksTable.user_id, adminId),
            eq(UserLinksTable.label, "GitHub")
          )
        )
      await db
        .update(UserLinksTable)
        .set({ platform: "linkedin" })
        .where(
          and(
            eq(UserLinksTable.user_id, adminId),
            eq(UserLinksTable.label, "LinkedIn")
          )
        )
      console.log("✓ Admin demo links updated")
    }

    const [existingSkill] = await db
      .select({ id: SkillsTable.id })
      .from(SkillsTable)
      .where(eq(SkillsTable.user_id, adminId))
      .limit(1)

    if (!existingSkill) {
      await db.insert(SkillsTable).values(
        demoSkills.map((skill, index) => ({
          user_id: adminId,
          name: skill.name,
          category: skill.category,
          sort_order: index,
        }))
      )
      console.log("✓ Admin demo skills seeded")
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

      const [insertedProject] = await db
        .insert(ProjectsTable)
        .values({
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
        })
        .returning({ id: ProjectsTable.id })

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

    for (const credential of demoCredentials) {
      const issuerId = issuerIdBySlug.get(credential.issuerSlug)

      if (!issuerId) {
        throw new Error(
          `Missing seeded issuer for demo credential: ${credential.issuerSlug}`
        )
      }

      const [existingCredential] = await db
        .select({ id: CredentialsTable.id })
        .from(CredentialsTable)
        .where(
          and(
            eq(CredentialsTable.user_id, adminId),
            eq(CredentialsTable.slug, credential.slug)
          )
        )
        .limit(1)

      if (existingCredential) {
        await db
          .update(CredentialsTable)
          .set({
            issuer_id: issuerId,
            title: credential.title,
            source_type: credential.source_type,
            verification_status: credential.verification_status,
            credential_code: credential.credential_code,
            verification_url: credential.verification_url,
            certificate_asset_key: credential.certificate_asset_key,
            issued_on: credential.issued_on,
            expires_on: credential.expires_on,
            summary: credential.summary,
            status: credential.status,
            updated_at: new Date(),
          })
          .where(eq(CredentialsTable.id, existingCredential.id))

        continue
      }

      await db.insert(CredentialsTable).values({
        user_id: adminId,
        issuer_id: issuerId,
        slug: credential.slug,
        title: credential.title,
        source_type: credential.source_type,
        verification_status: credential.verification_status,
        credential_code: credential.credential_code,
        verification_url: credential.verification_url,
        certificate_asset_key: credential.certificate_asset_key,
        issued_on: credential.issued_on,
        expires_on: credential.expires_on,
        summary: credential.summary,
        status: credential.status,
      })
    }

    console.log("✓ Demo admin credentials seeded")
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
