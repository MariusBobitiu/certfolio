import "server-only"

import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME
const region = process.env.CLOUDFLARE_R2_REGION
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT

if (!accessKeyId || !secretAccessKey || !bucket || !region || !endpoint) {
  throw new Error(
    "Cloudflare R2 environment variables are required for asset uploads."
  )
}

const r2Client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function uploadProjectCoverImage({
  userId,
  projectSlug,
  file,
}: {
  userId: string
  projectSlug: string
  file: File
}) {
  const extension = extname(file.name) || ".jpg"
  const safeName = sanitizeFileName(file.name.replace(extension, "")) || "cover"
  const key = `projects/${userId}/${projectSlug}/cover-${Date.now()}-${randomUUID()}-${safeName}${extension}`
  const body = Buffer.from(await file.arrayBuffer())

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  )

  const url = await getProjectAssetUrl(key)

  return { key, url }
}

export async function getProjectAssetUrl(key: string) {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: 60 * 60 }
  )
}

export async function getProfileImageUrl(key: string) {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: 60 * 60 }
  )
}

export async function deleteProjectAsset(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}

export async function uploadCredentialCertificate({
  userId,
  file,
  credentialSlug,
}: {
  userId: string
  file: File
  credentialSlug?: string | null
}) {
  const extension = extname(file.name) || ".pdf"
  const safeName =
    sanitizeFileName(file.name.replace(extension, "")) || "certificate"
  const slugSegment = credentialSlug?.trim() || "drafts"
  const key = `credentials/${userId}/${slugSegment}/certificate-${Date.now()}-${randomUUID()}-${safeName}${extension}`
  const body = Buffer.from(await file.arrayBuffer())

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  )

  const url = await getCredentialAssetUrl(key)

  return { key, url }
}

export async function getCredentialAssetUrl(key: string) {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: 60 * 60 }
  )
}

export async function deleteCredentialAsset(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}

export async function uploadProfileImage({
  userId,
  file,
}: {
  userId: string
  file: File
}) {
  const extension = extname(file.name) || ".jpg"
  const safeName =
    sanitizeFileName(file.name.replace(extension, "")) || "avatar"
  const key = `profiles/${userId}/avatar-${Date.now()}-${randomUUID()}-${safeName}${extension}`
  const body = Buffer.from(await file.arrayBuffer())

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  )

  const url = await getProfileImageUrl(key)

  return { key, url }
}
