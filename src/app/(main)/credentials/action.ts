"use server"

import { and, desc, eq, or } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import {
  CredentialsTable,
  IssuersTable,
  db,
} from "@/lib/db/drizzle"
import {
  normalizeIssuerAliases,
  normalizeIssuerName,
} from "@/lib/db/credentials/issuer-normalization"
import { actionClient } from "@/lib/safe-action"
import { deleteCredentialAsset } from "@/lib/storage/r2"

import {
  createCredentialSchema,
  deleteCredentialSchema,
  updateCredentialSchema,
} from "./schema"

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

function deriveCredentialState({
  verificationUrl,
  certificateAssetKey,
}: {
  verificationUrl: string
  certificateAssetKey: string
}) {
  const trimmedUrl = verificationUrl.trim()
  const trimmedCertificateKey = certificateAssetKey.trim()

  if (!trimmedUrl) {
    return {
      sourceType: trimmedCertificateKey
        ? ("uploaded_certificate" as const)
        : ("manual" as const),
      verificationStatus: "self_declared" as const,
    }
  }

  try {
    const hostname = new URL(trimmedUrl).hostname.toLowerCase()
    const normalizedHostname = hostname.startsWith("www.")
      ? hostname.slice(4)
      : hostname

    if (
      normalizedHostname === "credly.com" ||
      normalizedHostname.endsWith(".credly.com")
    ) {
      return {
        sourceType: "credly" as const,
        verificationStatus: "verified_external" as const,
      }
    }
  } catch {
    return {
      sourceType: "manual" as const,
      verificationStatus: "self_declared" as const,
    }
  }

  return {
    sourceType: "issuer_link" as const,
    verificationStatus: "linked_external" as const,
  }
}

function parseIssuedMonth(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`)
}

function serializeCredentialDates<
  T extends {
    issuedOn: Date
    expiresOn?: Date | null
  },
>(credential: T) {
  return {
    ...credential,
    issuedOn: credential.issuedOn.toISOString(),
    expiresOn: credential.expiresOn ? credential.expiresOn.toISOString() : null,
  }
}

function selectCredentialShape() {
  return {
    id: CredentialsTable.id,
    slug: CredentialsTable.slug,
    title: CredentialsTable.title,
    sourceType: CredentialsTable.source_type,
    verificationStatus: CredentialsTable.verification_status,
    issuedOn: CredentialsTable.issued_on,
    expiresOn: CredentialsTable.expires_on,
    verificationUrl: CredentialsTable.verification_url,
    verificationCode: CredentialsTable.credential_code,
    certificateAssetKey: CredentialsTable.certificate_asset_key,
    summary: CredentialsTable.summary,
    status: CredentialsTable.status,
  }
}

async function generateUniqueCredentialSlug(userId: string, title: string) {
  const baseSlug = slugify(title) || "credential"
  let candidateSlug = baseSlug
  let suffix = 1

  while (true) {
    const [existingCredential] = await db
      .select({ id: CredentialsTable.id })
      .from(CredentialsTable)
      .where(
        and(
          eq(CredentialsTable.user_id, userId),
          eq(CredentialsTable.slug, candidateSlug)
        )
      )
      .limit(1)

    if (!existingCredential) {
      return candidateSlug
    }

    suffix += 1
    candidateSlug = `${baseSlug}-${suffix}`
  }
}

async function generateUniqueIssuerSlug(baseName: string) {
  const baseSlug = slugify(baseName) || "issuer"
  let candidateSlug = baseSlug
  let suffix = 1

  while (true) {
    const [existingIssuer] = await db
      .select({ id: IssuersTable.id })
      .from(IssuersTable)
      .where(eq(IssuersTable.slug, candidateSlug))
      .limit(1)

    if (!existingIssuer) {
      return candidateSlug
    }

    suffix += 1
    candidateSlug = `${baseSlug}-${suffix}`
  }
}

async function resolveCredentialIssuer({
  userId,
  issuerId,
  customIssuerName,
}: {
  userId: string
  issuerId: string
  customIssuerName: string
}) {
  const availableIssuers = await db
    .select({
      id: IssuersTable.id,
      displayName: IssuersTable.display_name,
      normalizedName: IssuersTable.normalized_name,
      aliases: IssuersTable.aliases,
      slug: IssuersTable.slug,
      kind: IssuersTable.kind,
      createdByUserId: IssuersTable.created_by_user_id,
      themeKey: IssuersTable.theme_key,
      logoUrl: IssuersTable.logo_url,
    })
    .from(IssuersTable)
    .where(
      or(
        eq(IssuersTable.kind, "seeded"),
        eq(IssuersTable.created_by_user_id, userId)
      )
    )
    .orderBy(desc(IssuersTable.created_at))

  if (issuerId) {
    const selectedIssuer = availableIssuers.find((issuer) => issuer.id === issuerId)

    if (!selectedIssuer) {
      throw new Error("Issuer not found")
    }

    return selectedIssuer
  }

  const displayName = customIssuerName.trim()
  const normalizedName = normalizeIssuerName(displayName)

  const existingMatch = availableIssuers.find(
    (issuer) =>
      issuer.normalizedName === normalizedName ||
      normalizeIssuerAliases(issuer.aliases).includes(normalizedName)
  )

  if (existingMatch) {
    return existingMatch
  }

  const slug = await generateUniqueIssuerSlug(displayName)

  const [issuer] = await db
    .insert(IssuersTable)
    .values({
      slug,
      display_name: displayName,
      normalized_name: normalizedName,
      aliases: [],
      kind: "custom",
      website_url: "",
      logo_url: "",
      theme_key: "",
      created_by_user_id: userId,
      updated_at: new Date(),
    })
    .returning({
      id: IssuersTable.id,
      displayName: IssuersTable.display_name,
      normalizedName: IssuersTable.normalized_name,
      aliases: IssuersTable.aliases,
      slug: IssuersTable.slug,
      kind: IssuersTable.kind,
      createdByUserId: IssuersTable.created_by_user_id,
      themeKey: IssuersTable.theme_key,
      logoUrl: IssuersTable.logo_url,
    })

  return issuer
}

export const createCredentialAction = actionClient
  .inputSchema(createCredentialSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) {
      return { failure: "Unauthorized" }
    }

    try {
      const issuer = await resolveCredentialIssuer({
        userId: session.user.id,
        issuerId: parsedInput.issuerId.trim(),
        customIssuerName: parsedInput.customIssuerName.trim(),
      })

      const slug = await generateUniqueCredentialSlug(
        session.user.id,
        parsedInput.title
      )

      const { sourceType, verificationStatus } = deriveCredentialState({
        verificationUrl: parsedInput.verificationUrl,
        certificateAssetKey: "",
      })

      const [credential] = await db
        .insert(CredentialsTable)
        .values({
          user_id: session.user.id,
          issuer_id: issuer.id,
          slug,
          title: parsedInput.title.trim(),
          source_type: sourceType,
          verification_status: verificationStatus,
          credential_code: parsedInput.verificationCode.trim(),
          verification_url: parsedInput.verificationUrl.trim(),
          certificate_asset_key: "",
          issued_on: parseIssuedMonth(parsedInput.issuedOn),
          expires_on: parsedInput.expiresOn
            ? parseIssuedMonth(parsedInput.expiresOn)
            : null,
          summary: parsedInput.summary.trim(),
          status: "draft",
          updated_at: new Date(),
        })
        .returning(selectCredentialShape())

      return {
        success: "Credential created",
        credential: serializeCredentialDates(credential),
        issuer: {
          id: issuer.id,
          displayName: issuer.displayName,
          normalizedName: issuer.normalizedName,
          aliases: issuer.aliases,
          kind: issuer.kind,
          themeKey: issuer.themeKey,
          logoUrl: issuer.logoUrl,
        },
      }
    } catch (error) {
      if (error instanceof Error) {
        return { failure: error.message }
      }

      return { failure: "We could not create the credential right now." }
    }
  })

export const updateCredentialAction = actionClient
  .inputSchema(updateCredentialSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) {
      return { failure: "Unauthorized" }
    }

    const [existingCredential] = await db
      .select({
        id: CredentialsTable.id,
        certificateAssetKey: CredentialsTable.certificate_asset_key,
      })
      .from(CredentialsTable)
      .where(
        and(
          eq(CredentialsTable.user_id, session.user.id),
          eq(CredentialsTable.slug, parsedInput.slug)
        )
      )
      .limit(1)

    if (!existingCredential) {
      return { failure: "Credential not found" }
    }

    try {
      const issuer = await resolveCredentialIssuer({
        userId: session.user.id,
        issuerId: parsedInput.issuerId.trim(),
        customIssuerName: parsedInput.customIssuerName.trim(),
      })

      const certificateAssetKey = parsedInput.certificateAssetKey.trim()
      const { sourceType, verificationStatus } = deriveCredentialState({
        verificationUrl: parsedInput.verificationUrl,
        certificateAssetKey,
      })

      const [credential] = await db
        .update(CredentialsTable)
        .set({
          issuer_id: issuer.id,
          title: parsedInput.title.trim(),
          source_type: sourceType,
          verification_status: verificationStatus,
          credential_code: parsedInput.verificationCode.trim(),
          verification_url: parsedInput.verificationUrl.trim(),
          certificate_asset_key: certificateAssetKey,
          issued_on: parseIssuedMonth(parsedInput.issuedOn),
          expires_on: parsedInput.expiresOn
            ? parseIssuedMonth(parsedInput.expiresOn)
            : null,
          summary: parsedInput.summary.trim(),
          status: parsedInput.status,
          updated_at: new Date(),
        })
        .where(eq(CredentialsTable.id, existingCredential.id))
        .returning(selectCredentialShape())

      if (
        existingCredential.certificateAssetKey &&
        existingCredential.certificateAssetKey !== certificateAssetKey
      ) {
        try {
          await deleteCredentialAsset(existingCredential.certificateAssetKey)
        } catch {
          return {
            failure: "Credential saved, but the old certificate file could not be removed.",
          }
        }
      }

      return {
        success: "Credential updated",
        credential: serializeCredentialDates(credential),
        issuer: {
          id: issuer.id,
          displayName: issuer.displayName,
          normalizedName: issuer.normalizedName,
          aliases: issuer.aliases,
          kind: issuer.kind,
          themeKey: issuer.themeKey,
          logoUrl: issuer.logoUrl,
        },
      }
    } catch (error) {
      if (error instanceof Error) {
        return { failure: error.message }
      }

      return { failure: "We could not update the credential right now." }
    }
  })

export const deleteCredentialAction = actionClient
  .inputSchema(deleteCredentialSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) {
      return { failure: "Unauthorized" }
    }

    const [existingCredential] = await db
      .select({
        id: CredentialsTable.id,
        certificateAssetKey: CredentialsTable.certificate_asset_key,
      })
      .from(CredentialsTable)
      .where(
        and(
          eq(CredentialsTable.user_id, session.user.id),
          eq(CredentialsTable.slug, parsedInput.slug)
        )
      )
      .limit(1)

    if (!existingCredential) {
      return { failure: "Credential not found" }
    }

    await db
      .update(CredentialsTable)
      .set({
        status: "archived",
        updated_at: new Date(),
      })
      .where(eq(CredentialsTable.id, existingCredential.id))

    return { success: "Credential removed from workspace" }
  })
