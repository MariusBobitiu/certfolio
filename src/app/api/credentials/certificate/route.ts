import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import { CredentialsTable, db } from "@/lib/db/drizzle"
import {
  deleteCredentialAsset,
  uploadCredentialCertificate,
} from "@/lib/storage/r2"

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
])

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const credentialSlug = formData.get("credentialSlug")
  const currentCertificateAssetKey = formData.get("currentCertificateAssetKey")

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Certificate file is required" },
      { status: 400 }
    )
  }

  if (typeof credentialSlug !== "string" || credentialSlug.trim().length === 0) {
    return NextResponse.json(
      { error: "Credential slug is required" },
      { status: 400 }
    )
  }

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, PNG, JPG, and WebP files are supported" },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Certificate file must be smaller than 8MB" },
      { status: 400 }
    )
  }

  const [credential] = await db
    .select({
      id: CredentialsTable.id,
      status: CredentialsTable.status,
    })
    .from(CredentialsTable)
    .where(
      and(
        eq(CredentialsTable.user_id, session.user.id),
        eq(CredentialsTable.slug, credentialSlug.trim())
      )
    )
    .limit(1)

  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 })
  }

  if (credential.status === "archived") {
    return NextResponse.json(
      { error: "Credential has already been removed from the workspace" },
      { status: 409 }
    )
  }

  const uploaded = await uploadCredentialCertificate({
    userId: session.user.id,
    credentialSlug: credentialSlug.trim(),
    file,
  })

  await db
    .update(CredentialsTable)
    .set({
      certificate_asset_key: uploaded.key,
      updated_at: new Date(),
    })
    .where(eq(CredentialsTable.id, credential.id))

  if (
    typeof currentCertificateAssetKey === "string" &&
    currentCertificateAssetKey.trim() &&
    currentCertificateAssetKey.trim() !== uploaded.key
  ) {
    try {
      await deleteCredentialAsset(currentCertificateAssetKey.trim())
    } catch {
      return NextResponse.json({
        key: uploaded.key,
        url: uploaded.url,
        warning:
          "Certificate uploaded, but the previous file could not be removed.",
      })
    }
  }

  return NextResponse.json({
    key: uploaded.key,
    url: uploaded.url,
  })
}
