import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { and, eq, gt, isNull } from "drizzle-orm"
import { Resend } from "resend"

import { db, VerificationsTable } from "@/lib/db/drizzle"

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60 // 1 hour

type SendPasswordResetParams = {
  userId: string
  email: string
  name: string
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000"
}

function buildResetUrl(token: string) {
  const url = new URL("/reset-password", getBaseUrl())
  url.searchParams.set("token", token)

  return url.toString()
}

async function createResetRecord(userId: string, email: string) {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = hashResetToken(token)
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(VerificationsTable)
      .set({ consumed_at: now })
      .where(
        and(
          eq(VerificationsTable.user_id, userId),
          eq(VerificationsTable.purpose, "password_reset"),
          eq(VerificationsTable.method, "email"),
          isNull(VerificationsTable.consumed_at)
        )
      )

    await tx.insert(VerificationsTable).values({
      user_id: userId,
      purpose: "password_reset",
      method: "email",
      target: email,
      token_hash: tokenHash,
      expires_at: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
      metadata: {},
    })
  })

  return token
}

export async function logPasswordResetEvent(
  userId: string,
  email: string,
  event: "requested" | "completed",
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const now = new Date()

  await db.insert(VerificationsTable).values({
    user_id: userId,
    purpose: "password_reset",
    method: "email",
    target: email,
    expires_at: now,
    consumed_at: now,
    metadata: {
      event,
      ipAddress: metadata?.ipAddress ?? null,
      userAgent: metadata?.userAgent ?? null,
    },
  })
}

export async function sendPasswordResetEmail(params: SendPasswordResetParams) {
  const token = await createResetRecord(params.userId, params.email)
  const resetUrl = buildResetUrl(token)

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Password reset email was not sent.")
    return
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.EMAIL_FROM ??
    (process.env.RESEND_EMAIL_FROM_DOMAIN
      ? `Certfolio <onboarding@${process.env.RESEND_EMAIL_FROM_DOMAIN}>`
      : "Certfolio <onboarding@resend.dev>")

  const { error } = await resend.emails.send({
    from,
    to: params.email,
    subject: "Reset your password for Certfolio",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Password reset request</h2>
        <p style="margin: 0 0 16px;">We received a request to reset your password for your Certfolio account. Click the link below to create a new password.</p>
        <p style="margin: 0 0 20px;">
          <a href="${resetUrl}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; display: inline-block;">Reset password</a>
        </p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">If the button does not work, copy and paste this link in your browser:</p>
        <p style="margin: 0; font-size: 14px;"><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
    text: `We received a request to reset your password. Open this link to create a new password: ${resetUrl}`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function validatePasswordResetToken(token: string) {
  const tokenHash = hashResetToken(token)

  const [verification] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.purpose, "password_reset"),
        eq(VerificationsTable.method, "email"),
        eq(VerificationsTable.token_hash, tokenHash),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, new Date())
      )
    )
    .limit(1)

  if (!verification) {
    return { success: false as const }
  }

  return {
    success: true as const,
    userId: verification.user_id,
    verificationId: verification.id,
  }
}

export async function consumePasswordResetToken(verificationId: string) {
  await db
    .update(VerificationsTable)
    .set({ consumed_at: new Date() })
    .where(eq(VerificationsTable.id, verificationId))
}
