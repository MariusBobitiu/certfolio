import "server-only"

import { createHash, createHmac, randomBytes } from "node:crypto"
import { and, eq, gt, isNull, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { Resend } from "resend"

import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import { db, VerificationsTable } from "@/lib/db/drizzle"

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

type SendPasswordResetParams = {
  userId: string
  email: string
  name: string
}

type PendingPasswordResetState = {
  userId: string
  createdAt: number
  signature: string
}

function hashResetCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

function generateResetCode(): string {
  const { CODE_LENGTH } = RATE_LIMIT_CONFIG.FORGOT_PASSWORD
  const alphabetLength = CODE_ALPHABET.length
  const bytes = randomBytes(CODE_LENGTH * 4)
  let code = ""

  for (let i = 0; i < CODE_LENGTH; i++) {
    const value = bytes.readUInt32BE(i * 4)
    code += CODE_ALPHABET[value % alphabetLength]
  }

  return code
}

function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

async function createResetRecord(userId: string, email: string) {
  const code = generateResetCode()
  const codeHash = hashResetCode(code)
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
      token_hash: codeHash,
      expires_at: new Date(now.getTime() + RATE_LIMIT_CONFIG.FORGOT_PASSWORD.CODE_TTL_MS),
      metadata: {},
    })
  })

  return code
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
  const code = await createResetRecord(params.userId, params.email)
  const formattedCode = formatCode(code)

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
        <p style="margin: 0 0 16px;">We received a request to reset your password for your Certfolio account. Enter the code below to create a new password.</p>
        <div style="margin: 0 0 20px; padding: 16px 24px; background: #f1f5f9; border-radius: 8px; display: inline-block;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace; color: #0f172a;">${formattedCode}</span>
        </div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">This code expires in 15 minutes.</p>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
    text: `We received a request to reset your password. Your reset code is: ${formattedCode}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function validatePasswordResetCode(userId: string, code: string) {
  const normalizedCode = code.replace(/-/g, "")
  const codeHash = hashResetCode(normalizedCode)

  const [verification] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.user_id, userId),
        eq(VerificationsTable.purpose, "password_reset"),
        eq(VerificationsTable.method, "email"),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, new Date())
      )
    )
    .limit(1)

  if (!verification) {
    return { success: false as const, reason: "expired" as const }
  }

  if (verification.attempts >= RATE_LIMIT_CONFIG.FORGOT_PASSWORD.MAX_CODE_ATTEMPTS) {
    return { success: false as const, reason: "too_many_attempts" as const }
  }

  if (verification.token_hash !== codeHash) {
    await db
      .update(VerificationsTable)
      .set({ attempts: sql`${VerificationsTable.attempts} + 1` })
      .where(eq(VerificationsTable.id, verification.id))

    return { success: false as const, reason: "invalid_code" as const }
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

// ---------------------------------------------------------------------------
// Pending cookie helpers
// ---------------------------------------------------------------------------

function getPasswordResetCookieKey() {
  const rawKey =
    process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ??
    process.env.MFA_TOTP_ENCRYPTION_KEY

  if (!rawKey) {
    throw new Error(
      "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is required for password reset cookies."
    )
  }

  return rawKey
}

function signPendingPasswordResetValue(userId: string, createdAt: number) {
  return createHmac("sha256", getPasswordResetCookieKey())
    .update(`${userId}:${createdAt}`)
    .digest("base64url")
}

function encodePendingPasswordResetCookie(userId: string, createdAt: number) {
  return Buffer.from(
    JSON.stringify({
      userId,
      createdAt,
      signature: signPendingPasswordResetValue(userId, createdAt),
    } satisfies PendingPasswordResetState)
  ).toString("base64url")
}

function decodePendingPasswordResetCookie(value: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<PendingPasswordResetState>

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.createdAt !== "number" ||
      typeof parsed.signature !== "string"
    ) {
      return null
    }

    return parsed as PendingPasswordResetState
  } catch {
    return null
  }
}

export async function setPasswordResetPendingCookie(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const createdAt = Date.now()

  cookieStore.set(
    RATE_LIMIT_CONFIG.FORGOT_PASSWORD.PENDING_COOKIE_NAME,
    encodePendingPasswordResetCookie(userId, createdAt),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(RATE_LIMIT_CONFIG.FORGOT_PASSWORD.PENDING_TTL_MS / 1000),
    }
  )
}

export async function getPasswordResetPendingCookie(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(RATE_LIMIT_CONFIG.FORGOT_PASSWORD.PENDING_COOKIE_NAME)

  if (!cookie?.value) {
    return null
  }

  const parsed = decodePendingPasswordResetCookie(cookie.value)

  if (!parsed) {
    return null
  }

  const expectedSignature = signPendingPasswordResetValue(parsed.userId, parsed.createdAt)

  if (
    expectedSignature !== parsed.signature ||
    Date.now() - parsed.createdAt > RATE_LIMIT_CONFIG.FORGOT_PASSWORD.PENDING_TTL_MS
  ) {
    return null
  }

  return { userId: parsed.userId }
}

export async function clearPasswordResetPendingCookie(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(RATE_LIMIT_CONFIG.FORGOT_PASSWORD.PENDING_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
}
