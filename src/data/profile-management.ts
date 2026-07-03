"use server"

import { and, eq, sql } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import {
  CredentialsTable,
  db,
  IssuersTable,
  ProjectsTable,
  UserLinksTable,
  UserPreferencesTable,
  UsersTable,
} from "@/lib/db/drizzle"
import { uploadProfileImage } from "@/lib/storage/r2"
import { slugAvailabilitySchema } from "@/lib/validations/profile"
import type { ProfileFormData } from "@/lib/validations/profile"

// ── Types ────────────────────────────────────────────────────────────────────

export type PublishedCredentialForPicker = {
  id: string
  title: string
  issuer_display_name: string
  issuer_theme_key: string
  verification_status: "verified_external" | "linked_external" | "self_declared"
}

export type PublishedProjectForPicker = {
  id: string
  title: string
  project_type: string
}

export type ProfileManagementData = {
  user: {
    id: string
    name: string
    slug: string
    image: string
  }
  preferences: {
    headline: string
    bio: string
    public_profile: boolean
    accent_colour: string
    featured_credential_ids: string[]
    featured_project_ids: string[]
  }
  links: {
    id: string
    platform: string
    label: string
    url: string
    sort_order: number
  }[]
  publishedCredentials: PublishedCredentialForPicker[]
  publishedProjects: PublishedProjectForPicker[]
}

// ── Fetch ────────────────────────────────────────────────────────────────────

export async function getProfileManagementData(
  userId: string
): Promise<ProfileManagementData> {
  const [user] = await db
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      slug: UsersTable.slug,
      image: UsersTable.image,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, userId))
    .limit(1)

  if (!user) {
    throw new Error("User not found")
  }

  const [prefs] = await db
    .select({
      headline: UserPreferencesTable.headline,
      bio: UserPreferencesTable.bio,
      public_profile: UserPreferencesTable.public_profile,
      accent_colour: UserPreferencesTable.accent_colour,
      featured_credential_ids: UserPreferencesTable.featured_credential_ids,
      featured_project_ids: UserPreferencesTable.featured_project_ids,
    })
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, userId))
    .limit(1)

  const links = await db
    .select({
      id: UserLinksTable.id,
      platform: UserLinksTable.platform,
      label: UserLinksTable.label,
      url: UserLinksTable.url,
      sort_order: UserLinksTable.sort_order,
    })
    .from(UserLinksTable)
    .where(eq(UserLinksTable.user_id, userId))
    .orderBy(UserLinksTable.sort_order)

  const publishedCredentials = await db
    .select({
      id: CredentialsTable.id,
      title: CredentialsTable.title,
      issuer_display_name: IssuersTable.display_name,
      issuer_theme_key: IssuersTable.theme_key,
      verification_status: CredentialsTable.verification_status,
    })
    .from(CredentialsTable)
    .innerJoin(IssuersTable, eq(CredentialsTable.issuer_id, IssuersTable.id))
    .where(
      and(
        eq(CredentialsTable.user_id, userId),
        eq(CredentialsTable.status, "published")
      )
    )
    .orderBy(CredentialsTable.issued_on)

  const publishedProjects = await db
    .select({
      id: ProjectsTable.id,
      title: ProjectsTable.title,
      project_type: ProjectsTable.project_type,
    })
    .from(ProjectsTable)
    .where(
      and(
        eq(ProjectsTable.user_id, userId),
        eq(ProjectsTable.status, "published")
      )
    )
    .orderBy(ProjectsTable.updated_at)

  return {
    user: {
      id: user.id,
      name: user.name,
      slug: user.slug ?? "",
      image: user.image ?? "",
    },
    preferences: {
      headline: prefs?.headline ?? "",
      bio: prefs?.bio ?? "",
      public_profile: prefs?.public_profile ?? true,
      accent_colour: prefs?.accent_colour ?? "blue",
      featured_credential_ids:
        prefs?.featured_credential_ids?.filter(Boolean) ?? [],
      featured_project_ids: prefs?.featured_project_ids?.filter(Boolean) ?? [],
    },
    links: links.map((l) => ({
      id: l.id,
      platform: l.platform,
      label: l.label,
      url: l.url,
      sort_order: l.sort_order,
    })),
    publishedCredentials,
    publishedProjects,
  }
}

// ── Save ─────────────────────────────────────────────────────────────────────

type SaveProfileInput = ProfileFormData & {
  imageKey?: string | null
  imageUrl?: string | null
  featuredCredentialIds: string[]
  featuredProjectIds: string[]
}

export async function saveProfile(
  userId: string,
  data: SaveProfileInput
): Promise<void> {
  // Update user core fields
  await db
    .update(UsersTable)
    .set({
      name: data.name,
      slug: data.slug,
      ...(data.imageUrl
        ? { image: data.imageUrl, updated_at: sql`now()` }
        : { updated_at: sql`now()` }),
    })
    .where(eq(UsersTable.id, userId))

  // Upsert preferences
  const [existingPrefs] = await db
    .select({ id: UserPreferencesTable.id })
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, userId))
    .limit(1)

  if (existingPrefs) {
    await db
      .update(UserPreferencesTable)
      .set({
        headline: data.headline,
        bio: data.bio,
        featured_credential_ids: data.featuredCredentialIds,
        featured_project_ids: data.featuredProjectIds,
        updated_at: sql`now()`,
      })
      .where(eq(UserPreferencesTable.user_id, userId))
  } else {
    await db.insert(UserPreferencesTable).values({
      user_id: userId,
      headline: data.headline,
      bio: data.bio,
      featured_credential_ids: data.featuredCredentialIds,
      featured_project_ids: data.featuredProjectIds,
    })
  }

  // Replace links: delete all, insert new
  await db.delete(UserLinksTable).where(eq(UserLinksTable.user_id, userId))

  if (data.links.length > 0) {
    await db.insert(UserLinksTable).values(
      data.links.map((link, index) => ({
        user_id: userId,
        platform: link.platform as string,
        label: link.label,
        url: link.url,
        sort_order: index,
      }))
    )
  }
}

// ── Image upload ─────────────────────────────────────────────────────────────

export async function uploadProfileImageAction(
  userId: string,
  file: File
): Promise<{ imageUrl: string }> {
  const session = await getCurrentSession()
  if (!session || session.user.id !== userId) {
    throw new Error("Unauthorized")
  }

  // Old R2 objects are not deleted in v1; cleanup can be added later

  const { url } = await uploadProfileImage({ userId, file })

  return { imageUrl: url }
}

// ── Visibility toggle ────────────────────────────────────────────────────────

export async function setProfileVisibility(
  userId: string,
  publicProfile: boolean
): Promise<void> {
  const session = await getCurrentSession()
  if (!session || session.user.id !== userId) {
    throw new Error("Unauthorized")
  }

  const [existing] = await db
    .select({ id: UserPreferencesTable.id })
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, userId))
    .limit(1)

  if (existing) {
    await db
      .update(UserPreferencesTable)
      .set({ public_profile: publicProfile, updated_at: sql`now()` })
      .where(eq(UserPreferencesTable.user_id, userId))
  } else {
    await db.insert(UserPreferencesTable).values({
      user_id: userId,
      public_profile: publicProfile,
    })
  }
}

// ── Slug availability ────────────────────────────────────────────────────────

export async function checkSlugAvailability(
  slug: string,
  currentUserId: string
): Promise<boolean> {
  const parsed = slugAvailabilitySchema.safeParse({ slug })
  if (!parsed.success) return false

  const [existing] = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(eq(UsersTable.slug, parsed.data.slug))
    .limit(1)

  // Available if no user has it, or the current user already owns it
  return !existing || existing.id === currentUserId
}
