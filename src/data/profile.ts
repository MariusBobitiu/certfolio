"use server"

import { and, desc, eq, inArray } from "drizzle-orm"

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
import { getProjectAssetUrl } from "@/lib/storage/r2"

export type PublicCredential = {
  id: string
  title: string
  issued_on: Date
  verification_status: "verified_external" | "linked_external" | "self_declared"
  verification_url: string
  issuer: {
    display_name: string
    theme_key: string
  }
}

export type PublicProject = {
  id: string
  slug: string
  title: string
  summary: string
  cover_image_url: string | null
  context: string
  outcome: string
  tools: string
  project_type: string
  role: string
  evidence: Array<{
    kind: string
    label: string
    url: string
  }>
}

export type PublicLink = {
  id: string
  platform: string
  label: string
  url: string
}

export type PublicProfileData =
  | {
      isPrivate: true
      user: { name: string; image: string; slug: string }
    }
  | {
      isPrivate: false
      user: { name: string; image: string; slug: string; email: string }
      preferences: {
        public_profile: boolean
        show_email: boolean
        bio: string
        headline: string
        accent_colour: string
      }
      links: PublicLink[]
      credentials: PublicCredential[]
      projects: PublicProject[]
    }

export async function getPublicProfileData(
  slug: string
): Promise<PublicProfileData | null> {
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "")

  const [user] = await db
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email,
      image: UsersTable.image,
      slug: UsersTable.slug,
    })
    .from(UsersTable)
    .where(eq(UsersTable.slug, sanitizedSlug))
    .limit(1)

  if (!user || !user.slug) return null

  const [prefs] = await db
    .select({
      public_profile: UserPreferencesTable.public_profile,
      show_email: UserPreferencesTable.show_email,
      bio: UserPreferencesTable.bio,
      headline: UserPreferencesTable.headline,
      accent_colour: UserPreferencesTable.accent_colour,
      featured_credential_ids: UserPreferencesTable.featured_credential_ids,
      featured_project_ids: UserPreferencesTable.featured_project_ids,
    })
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, user.id))
    .limit(1)

  // Treat missing preferences as private
  if (!prefs || !prefs.public_profile) {
    return {
      isPrivate: true,
      user: { name: user.name, image: user.image, slug: user.slug },
    }
  }

  // Fetch public links
  const links = await db
    .select({
      id: UserLinksTable.id,
      platform: UserLinksTable.platform,
      label: UserLinksTable.label,
      url: UserLinksTable.url,
    })
    .from(UserLinksTable)
    .where(eq(UserLinksTable.user_id, user.id))
    .orderBy(UserLinksTable.sort_order)

  // Fetch published credentials with issuer join, newest first
  const rawCredentials = await db
    .select({
      id: CredentialsTable.id,
      title: CredentialsTable.title,
      issued_on: CredentialsTable.issued_on,
      verification_status: CredentialsTable.verification_status,
      verification_url: CredentialsTable.verification_url,
      issuer_display_name: IssuersTable.display_name,
      issuer_theme_key: IssuersTable.theme_key,
    })
    .from(CredentialsTable)
    .innerJoin(IssuersTable, eq(CredentialsTable.issuer_id, IssuersTable.id))
    .where(
      and(
        eq(CredentialsTable.user_id, user.id),
        eq(CredentialsTable.status, "published")
      )
    )
    .orderBy(desc(CredentialsTable.issued_on))
    .limit(12)

  const credentials: PublicCredential[] = rawCredentials.map((c) => ({
    id: c.id,
    title: c.title,
    issued_on: c.issued_on,
    verification_status: c.verification_status,
    verification_url: c.verification_url,
    issuer: {
      display_name: c.issuer_display_name,
      theme_key: c.issuer_theme_key,
    },
  }))

  // Apply featured ordering if set, otherwise sort by tier then date
  const featuredCredIds = prefs.featured_credential_ids?.filter(Boolean) ?? []
  if (featuredCredIds.length > 0) {
    const lookup = new Map(credentials.map((c) => [c.id, c]))
    const ordered = featuredCredIds
      .map((id) => lookup.get(id))
      .filter((c): c is PublicCredential => c !== undefined)
    // Fallback: append any credentials not in featured list (though featured should be exhaustive for published creds)
    for (const c of credentials) {
      if (!featuredCredIds.includes(c.id)) {
        ordered.push(c)
      }
    }
    // Reassign (const array, so replace contents)
    credentials.length = 0
    credentials.push(...ordered)
  } else {
    // Default sort: verified first, then linked, then self-declared
    const TIER_ORDER: Record<string, number> = {
      verified_external: 0,
      linked_external: 1,
      self_declared: 2,
    }
    credentials.sort(
      (a, b) =>
        (TIER_ORDER[a.verification_status] ?? 3) -
        (TIER_ORDER[b.verification_status] ?? 3)
    )
  }

  // Fetch published projects, newest first
  const rawProjects = await db
    .select()
    .from(ProjectsTable)
    .where(
      and(
        eq(ProjectsTable.user_id, user.id),
        eq(ProjectsTable.status, "published")
      )
    )
    .orderBy(desc(ProjectsTable.updated_at))
    .limit(6)

  // Fetch evidence links for all projects in one query
  const projectIds = rawProjects.map((p) => p.id)
  const allEvidence =
    projectIds.length > 0
      ? await db
          .select()
          .from(ProjectEvidenceLinksTable)
          .where(inArray(ProjectEvidenceLinksTable.project_id, projectIds))
          .orderBy(ProjectEvidenceLinksTable.sort_order)
      : []

  // Build projects with their evidence, resolving cover image URLs
  const projects: PublicProject[] = await Promise.all(
    rawProjects.map(async (p) => {
      const evidence = allEvidence
        .filter((e) => e.project_id === p.id)
        .map((e) => ({ kind: e.kind, label: e.label, url: e.url }))

      let cover_image_url: string | null = null
      if (p.cover_image_key) {
        try {
          cover_image_url = await getProjectAssetUrl(p.cover_image_key)
        } catch {
          cover_image_url = null
        }
      }

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        cover_image_url,
        context: p.context,
        outcome: p.outcome,
        tools: p.tools,
        project_type: p.project_type,
        role: p.role,
        evidence,
      }
    })
  )

  // Apply featured ordering for projects if set, otherwise keep date order
  const featuredProjIds = prefs.featured_project_ids?.filter(Boolean) ?? []
  if (featuredProjIds.length > 0) {
    const lookup = new Map(projects.map((p) => [p.id, p]))
    const ordered = featuredProjIds
      .map((id) => lookup.get(id))
      .filter((p): p is PublicProject => p !== undefined)
    for (const p of projects) {
      if (!featuredProjIds.includes(p.id)) {
        ordered.push(p)
      }
    }
    projects.length = 0
    projects.push(...ordered)
  }

  return {
    isPrivate: false,
    user: {
      name: user.name,
      image: user.image,
      slug: user.slug,
      email: user.email,
    },
    preferences: {
      public_profile: prefs.public_profile,
      show_email: prefs.show_email,
      bio: prefs.bio,
      headline: prefs.headline ?? "",
      accent_colour: prefs.accent_colour,
    },
    links: links.map((l) => ({
      id: l.id,
      platform: l.platform,
      label: l.label,
      url: l.url,
    })),
    credentials,
    projects,
  }
}
