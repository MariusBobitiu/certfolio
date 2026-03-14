import "server-only"

import { createHash, createHmac, randomBytes } from "node:crypto"
import { and, eq, gt, isNull } from "drizzle-orm"
import { cookies } from "next/headers"
import { Resend } from "resend"

import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import { db, UsersTable, VerificationsTable } from "@/lib/db/drizzle"

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24

type SendEmailVerificationParams = {
  userId: string
  email: string
  name: string
}

type PendingEmailVerificationState = {
  userId: string
  email: string
  confirmedAt: number
  signature: string
}

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function getEmailVerificationCookieKey() {
  const rawKey =
    process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ??
    process.env.MFA_TOTP_ENCRYPTION_KEY

  if (!rawKey) {
    throw new Error(
      "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is required for email verification cookies."
    )
  }

  return rawKey
}

function signPendingEmailVerificationValue(
  userId: string,
  email: string,
  confirmedAt: number
) {
  return createHmac("sha256", getEmailVerificationCookieKey())
    .update(`${userId}:${email}:${confirmedAt}`)
    .digest("base64url")
}

function encodePendingEmailVerificationCookie(
  userId: string,
  email: string,
  confirmedAt: number
) {
  return Buffer.from(
    JSON.stringify({
      userId,
      email,
      confirmedAt,
      signature: signPendingEmailVerificationValue(userId, email, confirmedAt),
    } satisfies PendingEmailVerificationState)
  ).toString("base64url")
}

function decodePendingEmailVerificationCookie(value: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<PendingEmailVerificationState>

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.confirmedAt !== "number" ||
      typeof parsed.signature !== "string"
    ) {
      return null
    }

    return parsed as PendingEmailVerificationState
  } catch {
    return null
  }
}

export function getMaskedEmail(email: string) {
  const [localPart, domain] = email.split("@")

  if (!localPart || !domain) {
    return email
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}*@${domain}`
  }

  return `${localPart.slice(0, 2)}${"*".repeat(
    Math.max(1, localPart.length - 2)
  )}@${domain}`
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000"
}

function buildVerificationUrl(token: string) {
  const url = new URL("/verify-email", getBaseUrl())
  url.searchParams.set("token", token)

  return url.toString()
}

async function createVerificationRecord(userId: string, email: string) {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = hashVerificationToken(token)

  await db.insert(VerificationsTable).values({
    user_id: userId,
    purpose: "email_verification",
    method: "email",
    target: email,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    metadata: {},
  })

  return token
}

export async function sendEmailVerification(params: SendEmailVerificationParams) {
  const token = await createVerificationRecord(params.userId, params.email)
  const verificationUrl = buildVerificationUrl(token)

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Email verification message was not sent.")
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
    subject: "Verify your email for Certfolio",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Welcome to Certfolio, ${params.name}.</h2>
        <p style="margin: 0 0 16px;">Please verify your email to secure your account and unlock all features.</p>
        <p style="margin: 0 0 20px;">
          <a href="${verificationUrl}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; display: inline-block;">Verify email</a>
        </p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">If the button does not work, copy and paste this link in your browser:</p>
        <p style="margin: 0; font-size: 14px;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      </div>
    `,
    text: `Welcome to Certfolio, ${params.name}. Verify your email by opening this link: ${verificationUrl}`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashVerificationToken(token)

  const [verification] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.purpose, "email_verification"),
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

  await db.transaction(async (tx) => {
    await tx
      .update(UsersTable)
      .set({ email_verified_at: new Date() })
      .where(eq(UsersTable.id, verification.user_id))

    await tx
      .update(VerificationsTable)
      .set({ consumed_at: new Date() })
      .where(eq(VerificationsTable.id, verification.id))
  })

  return {
    success: true as const,
    userId: verification.user_id,
  }
}

export async function setPendingEmailVerificationCookie(params: {
  userId: string
  email: string
}) {
  const cookieStore = await cookies()
  const confirmedAt = Date.now()

  cookieStore.set(
    RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.PENDING_COOKIE_NAME,
    encodePendingEmailVerificationCookie(
      params.userId,
      params.email,
      confirmedAt
    ),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(
        RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.PENDING_TTL_MS / 1000
      ),
    }
  )
}

export async function clearPendingEmailVerificationCookie() {
  const cookieStore = await cookies()

  cookieStore.set(RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.PENDING_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
}

export async function getPendingEmailVerificationCookie() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(
    RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.PENDING_COOKIE_NAME
  )

  if (!cookie?.value) {
    return null
  }

  const parsed = decodePendingEmailVerificationCookie(cookie.value)

  if (!parsed) {
    await clearPendingEmailVerificationCookie()
    return null
  }

  const expectedSignature = signPendingEmailVerificationValue(
    parsed.userId,
    parsed.email,
    parsed.confirmedAt
  )

  if (
    expectedSignature !== parsed.signature ||
    Date.now() - parsed.confirmedAt >
      RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.PENDING_TTL_MS
  ) {
    await clearPendingEmailVerificationCookie()
    return null
  }

  return {
    userId: parsed.userId,
    email: parsed.email,
    maskedEmail: getMaskedEmail(parsed.email),
  }
}
