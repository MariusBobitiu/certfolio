import type { Route } from "next"
import { and, count, desc, eq, ne } from "drizzle-orm"

import {
  CredentialsTable,
  db,
  IssuersTable,
  ProjectEvidenceLinksTable,
  ProjectsTable,
  UserLinksTable,
  UserPreferencesTable,
  UsersTable,
} from "@/lib/db/drizzle"

export type DashboardAction = {
  title: string
  description: string
  href: Route
  label: string
  icon:
    | "credential"
    | "checklist"
    | "warning"
    | "project"
    | "evidence"
    | "profile"
    | "complete"
    | "add"
  tone: "primary" | "warning" | "neutral"
}

export type DashboardRecentItem = {
  id: string
  title: string
  context: string
  status: "draft" | "published"
  href: Route
  updatedAt: Date
  type: "Credential" | "Project"
}

export type DashboardData = {
  publishedTotal: number
  profile: {
    completeness: number
    completedChecks: number
    checks: { label: string; complete: boolean }[]
    public: boolean
    publicHref: Route | null
  }
  stats: {
    publishedCredentials: number
    draftCredentials: number
    verifiedCredentials: number
    linkedCredentials: number
    publishedProjects: number
    draftProjects: number
    evidenceCount: number
  }
  credentialHealth: {
    expiring: number
    expired: number
  }
  actions: DashboardAction[]
  recentItems: DashboardRecentItem[]
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [credentials, projects, profileRows, linkCountRows] = await Promise.all(
    [
      db
        .select({
          id: CredentialsTable.id,
          slug: CredentialsTable.slug,
          title: CredentialsTable.title,
          status: CredentialsTable.status,
          verificationStatus: CredentialsTable.verification_status,
          expiresOn: CredentialsTable.expires_on,
          updatedAt: CredentialsTable.updated_at,
          issuerName: IssuersTable.display_name,
        })
        .from(CredentialsTable)
        .innerJoin(
          IssuersTable,
          eq(CredentialsTable.issuer_id, IssuersTable.id)
        )
        .where(
          and(
            eq(CredentialsTable.user_id, userId),
            ne(CredentialsTable.status, "archived")
          )
        )
        .orderBy(desc(CredentialsTable.updated_at)),
      db
        .select({
          id: ProjectsTable.id,
          slug: ProjectsTable.slug,
          title: ProjectsTable.title,
          projectType: ProjectsTable.project_type,
          status: ProjectsTable.status,
          updatedAt: ProjectsTable.updated_at,
          evidenceCount: count(ProjectEvidenceLinksTable.id),
        })
        .from(ProjectsTable)
        .leftJoin(
          ProjectEvidenceLinksTable,
          eq(ProjectEvidenceLinksTable.project_id, ProjectsTable.id)
        )
        .where(
          and(
            eq(ProjectsTable.user_id, userId),
            ne(ProjectsTable.status, "archived")
          )
        )
        .groupBy(ProjectsTable.id)
        .orderBy(desc(ProjectsTable.updated_at)),
      db
        .select({
          image: UsersTable.image,
          imageKey: UsersTable.image_key,
          slug: UsersTable.slug,
          headline: UserPreferencesTable.headline,
          bio: UserPreferencesTable.bio,
          publicProfile: UserPreferencesTable.public_profile,
          featuredCredentialIds: UserPreferencesTable.featured_credential_ids,
          featuredProjectIds: UserPreferencesTable.featured_project_ids,
        })
        .from(UsersTable)
        .leftJoin(
          UserPreferencesTable,
          eq(UserPreferencesTable.user_id, UsersTable.id)
        )
        .where(eq(UsersTable.id, userId))
        .limit(1),
      db
        .select({ total: count(UserLinksTable.id) })
        .from(UserLinksTable)
        .where(eq(UserLinksTable.user_id, userId)),
    ]
  )

  const profile = profileRows[0]
  const linkCount = linkCountRows[0]?.total ?? 0
  const publishedCredentials = credentials.filter(
    (credential) => credential.status === "published"
  )
  const draftCredentials = credentials.filter(
    (credential) => credential.status === "draft"
  )
  const verifiedCredentials = publishedCredentials.filter(
    (credential) => credential.verificationStatus === "verified_external"
  )
  const linkedCredentials = publishedCredentials.filter(
    (credential) => credential.verificationStatus === "linked_external"
  )
  const publishedProjects = projects.filter(
    (project) => project.status === "published"
  )
  const draftProjects = projects.filter((project) => project.status === "draft")
  const evidenceCount = publishedProjects.reduce(
    (total, project) => total + project.evidenceCount,
    0
  )
  const projectsWithoutEvidence = projects.filter(
    (project) => project.evidenceCount === 0
  )

  const now = new Date()
  const expiryWindow = new Date(now)
  expiryWindow.setDate(expiryWindow.getDate() + 90)
  const expiredCredentials = credentials.filter(
    (credential) => credential.expiresOn && credential.expiresOn < now
  )
  const expiringCredentials = credentials.filter(
    (credential) =>
      credential.expiresOn &&
      credential.expiresOn >= now &&
      credential.expiresOn <= expiryWindow
  )

  const profileChecks = [
    {
      label: "Profile photo",
      complete: Boolean(profile?.imageKey || profile?.image),
    },
    {
      label: "Professional headline",
      complete: Boolean(profile?.headline?.trim()),
    },
    { label: "About section", complete: Boolean(profile?.bio?.trim()) },
    { label: "External link", complete: linkCount > 0 },
    {
      label: "Featured credential",
      complete: (profile?.featuredCredentialIds?.length ?? 0) > 0,
    },
    {
      label: "Featured project",
      complete: (profile?.featuredProjectIds?.length ?? 0) > 0,
    },
  ]
  const completedProfileChecks = profileChecks.filter(
    (check) => check.complete
  ).length
  const profileCompleteness = Math.round(
    (completedProfileChecks / profileChecks.length) * 100
  )
  const nextProfileCheck = profileChecks.find((check) => !check.complete)
  const publicProfile = profile?.publicProfile ?? true
  const publicProfileHref: Route | null = profile?.slug
    ? (`/u/${profile.slug}` as Route)
    : null

  const actions: DashboardAction[] = []

  if (credentials.length === 0) {
    actions.push({
      title: "Add your first credential",
      description:
        "Start with a qualification, certification, or digital badge.",
      href: "/credentials",
      label: "Add credential",
      icon: "credential",
      tone: "primary",
    })
  } else if (draftCredentials.length > 0) {
    actions.push({
      title: `Finish ${draftCredentials.length} credential ${draftCredentials.length === 1 ? "draft" : "drafts"}`,
      description:
        "Publish finished records so they can strengthen your profile.",
      href: "/credentials",
      label: "Review drafts",
      icon: "checklist",
      tone: "warning",
    })
  }

  if (expiredCredentials.length > 0 || expiringCredentials.length > 0) {
    const affected = expiredCredentials.length + expiringCredentials.length
    actions.push({
      title: `${affected} credential${affected === 1 ? " needs" : "s need"} attention`,
      description:
        expiredCredentials.length > 0
          ? `${expiredCredentials.length} expired and ${expiringCredentials.length} expiring within 90 days.`
          : `${expiringCredentials.length} expiring within the next 90 days.`,
      href: "/credentials",
      label: "Review credentials",
      icon: "warning",
      tone: "warning",
    })
  }

  if (projects.length === 0) {
    actions.push({
      title: "Turn your work into proof",
      description:
        "Add a project with context, outcomes, and supporting evidence.",
      href: "/projects",
      label: "Add project",
      icon: "project",
      tone: "primary",
    })
  } else if (draftProjects.length > 0) {
    actions.push({
      title: `Finish ${draftProjects.length} project ${draftProjects.length === 1 ? "draft" : "drafts"}`,
      description: "Complete the story and publish your strongest work.",
      href: "/projects",
      label: "Review drafts",
      icon: "project",
      tone: "warning",
    })
  } else if (projectsWithoutEvidence.length > 0) {
    const project = projectsWithoutEvidence[0]
    actions.push({
      title: "Add evidence to a project",
      description: `${project.title} has no supporting link yet.`,
      href: `/projects/${project.slug}` as Route,
      label: "Add evidence",
      icon: "evidence",
      tone: "neutral",
    })
  }

  if (nextProfileCheck) {
    actions.push({
      title: `Add your ${nextProfileCheck.label.toLowerCase()}`,
      description: `Your profile is ${profileCompleteness}% complete. Finish the details people use to understand your work.`,
      href: "/profile",
      label: "Edit profile",
      icon: "profile",
      tone: "neutral",
    })
  }

  if (actions.length === 0) {
    actions.push(
      {
        title: "Your portfolio is in good shape",
        description:
          "Review the public view and make sure the story still feels current.",
        href: publicProfileHref ?? "/profile",
        label: publicProfileHref ? "View profile" : "Review profile",
        icon: "complete",
        tone: "primary",
      },
      {
        title: "Add your next achievement",
        description: "Keep your body of evidence current as your work grows.",
        href: "/credentials",
        label: "Add credential",
        icon: "add",
        tone: "neutral",
      }
    )
  }

  const recentItems: DashboardRecentItem[] = [
    ...credentials.map((credential) => ({
      id: credential.id,
      title: credential.title,
      context: credential.issuerName,
      status: credential.status as "draft" | "published",
      href: `/credentials/${credential.slug}` as Route,
      updatedAt: credential.updatedAt,
      type: "Credential" as const,
    })),
    ...projects.map((project) => ({
      id: project.id,
      title: project.title,
      context: project.projectType,
      status: project.status as "draft" | "published",
      href: `/projects/${project.slug}` as Route,
      updatedAt: project.updatedAt,
      type: "Project" as const,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)

  return {
    publishedTotal: publishedCredentials.length + publishedProjects.length,
    profile: {
      completeness: profileCompleteness,
      completedChecks: completedProfileChecks,
      checks: profileChecks,
      public: publicProfile,
      publicHref: publicProfileHref,
    },
    stats: {
      publishedCredentials: publishedCredentials.length,
      draftCredentials: draftCredentials.length,
      verifiedCredentials: verifiedCredentials.length,
      linkedCredentials: linkedCredentials.length,
      publishedProjects: publishedProjects.length,
      draftProjects: draftProjects.length,
      evidenceCount,
    },
    credentialHealth: {
      expiring: expiringCredentials.length,
      expired: expiredCredentials.length,
    },
    actions: actions.slice(0, 3),
    recentItems,
  }
}
