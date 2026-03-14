import "server-only"

import { createHash, randomInt } from "node:crypto"
import { cookies } from "next/headers"
import { and, desc, eq, gt, isNotNull, isNull } from "drizzle-orm"
import { Resend } from "resend"

import {
  db,
  UserMfaMethodsTable,
  UsersTable,
  VerificationsTable,
} from "@/lib/db/drizzle"

const MFA_PENDING_COOKIE_NAME = "cfl_mfa"
const EMAIL_MFA_CODE_TTL_MS = 1000 * 60 * 10
const EMAIL_MFA_RESEND_INTERVAL_MS = 1000 * 60
const EMAIL_MFA_MAX_ATTEMPTS = 5

type PendingMfaState = {
  method: "email" | "totp"
  userId: string
  verificationId: string
}

type EmailMfaChallengeMetadata = {
  rememberMe?: boolean
  ipAddress?: string | null
  city?: string | null
  userAgent?: string | null
}

type IssueEmailMfaChallengeParams = {
  userId: string
  email: string
  name: string
  rememberMe: boolean
  ipAddress?: string | null
  city?: string | null
  userAgent?: string | null
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  )
}

function hashVerificationCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

function generateVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0")
}

function encodePendingMfaState(state: PendingMfaState) {
  return Buffer.from(JSON.stringify(state)).toString("base64url")
}

function decodePendingMfaState(value: string): PendingMfaState | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"))

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed.method !== "email" && parsed.method !== "totp") ||
      typeof parsed.userId !== "string" ||
      typeof parsed.verificationId !== "string"
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function getEmailMfaMask(email: string) {
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

async function sendEmailMfaCodeEmail(params: {
  email: string
  name: string
  code: string
}) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. MFA email was not sent.")
    return
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.EMAIL_FROM ??
    (process.env.RESEND_EMAIL_FROM_DOMAIN
      ? `Certfolio <onboarding@${process.env.RESEND_EMAIL_FROM_DOMAIN}>`
      : "Certfolio <onboarding@resend.dev>")

  const mfaUrl = new URL("/mfa", getBaseUrl()).toString()

  const { error } = await resend.emails.send({
    from,
    to: params.email,
    subject: "Your Certfolio verification code",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Your verification code</h2>
        <p style="margin: 0 0 16px;">Hi ${params.name}, use this code to finish signing in to Certfolio:</p>
        <p style="margin: 0 0 20px; font-size: 32px; font-weight: 700; letter-spacing: 0.3em;">${params.code}</p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">This code expires in 10 minutes. If you did not start this sign-in, you can ignore this email.</p>
        <p style="margin: 0; font-size: 14px;"><a href="${mfaUrl}">Return to Certfolio</a></p>
      </div>
    `,
    text: `Hi ${params.name}, your Certfolio verification code is ${params.code}. It expires in 10 minutes. Return to ${mfaUrl} to complete sign-in.`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function getEnabledMfaMethods(userId: string) {
  return db
    .select()
    .from(UserMfaMethodsTable)
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, userId),
        isNotNull(UserMfaMethodsTable.enabled_at),
        isNull(UserMfaMethodsTable.disabled_at)
      )
    )
    .orderBy(
      desc(UserMfaMethodsTable.is_primary),
      desc(UserMfaMethodsTable.created_at)
    )
}

export async function getMfaMethodSummary(userId: string) {
  const methods = await db
    .select({
      method: UserMfaMethodsTable.method,
      enabled_at: UserMfaMethodsTable.enabled_at,
      disabled_at: UserMfaMethodsTable.disabled_at,
    })
    .from(UserMfaMethodsTable)
    .where(eq(UserMfaMethodsTable.user_id, userId))

  const activeMethods = methods.filter(
    (method) => method.enabled_at && !method.disabled_at
  )

  return {
    emailEnabled: activeMethods.some((method) => method.method === "email"),
    totpEnabled: activeMethods.some((method) => method.method === "totp"),
    activeMethodCount: activeMethods.length,
  }
}

export async function enableEmailMfaMethod(userId: string) {
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(UserMfaMethodsTable)
      .set({ is_primary: false, updated_at: now })
      .where(eq(UserMfaMethodsTable.user_id, userId))

    const [existing] = await tx
      .select()
      .from(UserMfaMethodsTable)
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, userId),
          eq(UserMfaMethodsTable.method, "email")
        )
      )
      .limit(1)

    if (existing) {
      await tx
        .update(UserMfaMethodsTable)
        .set({
          label: "Email code",
          is_primary: true,
          enabled_at: now,
          verified_at: existing.verified_at ?? now,
          disabled_at: null,
          updated_at: now,
        })
        .where(eq(UserMfaMethodsTable.id, existing.id))
    } else {
      await tx.insert(UserMfaMethodsTable).values({
        user_id: userId,
        method: "email",
        label: "Email code",
        is_primary: true,
        enabled_at: now,
        verified_at: now,
      })
    }

    await tx.insert(VerificationsTable).values({
      user_id: userId,
      purpose: "mfa_enrollment",
      method: "email",
      expires_at: now,
      consumed_at: now,
      metadata: { enrolled: true },
    })
  })
}

export async function disableEmailMfaMethod(userId: string) {
  const now = new Date()

  await db
    .update(UserMfaMethodsTable)
    .set({
      is_primary: false,
      disabled_at: now,
      updated_at: now,
    })
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, userId),
        eq(UserMfaMethodsTable.method, "email"),
        isNull(UserMfaMethodsTable.disabled_at)
      )
    )
}

export async function issueEmailMfaChallenge(
  params: IssueEmailMfaChallengeParams
) {
  const now = new Date()
  const [existingChallenge] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.user_id, params.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, "email"),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, now)
      )
    )
    .orderBy(desc(VerificationsTable.created_at))
    .limit(1)

  const metadata: EmailMfaChallengeMetadata = {
    rememberMe: params.rememberMe,
    ipAddress: params.ipAddress ?? null,
    city: params.city ?? null,
    userAgent: params.userAgent ?? null,
  }

  const canResend =
    !existingChallenge ||
    now.getTime() - existingChallenge.last_sent_at.getTime() >=
      EMAIL_MFA_RESEND_INTERVAL_MS

  if (!canResend) {
    return {
      verificationId: existingChallenge.id,
      sent: false,
      resendAvailableAt: new Date(
        existingChallenge.last_sent_at.getTime() + EMAIL_MFA_RESEND_INTERVAL_MS
      ),
    }
  }

  const code = generateVerificationCode()

  // Temporarily log the code for development purposes. In production, you would not want to log this.
  console.log(`Generated MFA code for user ${params.userId}: ${code}`)
  const codeHash = hashVerificationCode(code)
  const expiresAt = new Date(now.getTime() + EMAIL_MFA_CODE_TTL_MS)

  let verificationId = existingChallenge?.id

  if (existingChallenge) {
    await db
      .update(VerificationsTable)
      .set({
        target: params.email,
        token_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
        last_sent_at: now,
        metadata,
      })
      .where(eq(VerificationsTable.id, existingChallenge.id))
  } else {
    const [verification] = await db
      .insert(VerificationsTable)
      .values({
        user_id: params.userId,
        purpose: "mfa_challenge",
        method: "email",
        target: params.email,
        token_hash: codeHash,
        expires_at: expiresAt,
        last_sent_at: now,
        metadata,
      })
      .returning({ id: VerificationsTable.id })

    verificationId = verification.id
  }

  await sendEmailMfaCodeEmail({
    email: params.email,
    name: params.name,
    code,
  })

  return {
    verificationId: verificationId!,
    sent: true,
    resendAvailableAt: new Date(now.getTime() + EMAIL_MFA_RESEND_INTERVAL_MS),
  }
}

export async function verifyEmailMfaChallenge(params: {
  verificationId: string
  userId: string
  code: string
}) {
  const now = new Date()
  const [challenge] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.id, params.verificationId),
        eq(VerificationsTable.user_id, params.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, "email"),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, now)
      )
    )
    .limit(1)

  if (!challenge || !challenge.token_hash) {
    return {
      success: false as const,
      failure: "This verification code has expired.",
    }
  }

  const nextAttempts = challenge.attempts + 1
  const codeValid = hashVerificationCode(params.code) === challenge.token_hash

  if (!codeValid) {
    await db
      .update(VerificationsTable)
      .set({
        attempts: nextAttempts,
        consumed_at: nextAttempts >= EMAIL_MFA_MAX_ATTEMPTS ? now : null,
      })
      .where(eq(VerificationsTable.id, challenge.id))

    return {
      success: false as const,
      failure:
        nextAttempts >= EMAIL_MFA_MAX_ATTEMPTS
          ? "Too many incorrect attempts. Request a new code."
          : "The code you entered is incorrect.",
    }
  }

  await db
    .update(VerificationsTable)
    .set({ consumed_at: now })
    .where(eq(VerificationsTable.id, challenge.id))

  await db
    .update(UserMfaMethodsTable)
    .set({ last_used_at: now, updated_at: now })
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, params.userId),
        eq(UserMfaMethodsTable.method, "email"),
        isNull(UserMfaMethodsTable.disabled_at)
      )
    )

  return {
    success: true as const,
    metadata: (challenge.metadata ?? {}) as EmailMfaChallengeMetadata,
  }
}

export async function setPendingMfaCookie(state: PendingMfaState) {
  const cookieStore = await cookies()

  cookieStore.set(MFA_PENDING_COOKIE_NAME, encodePendingMfaState(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(EMAIL_MFA_CODE_TTL_MS / 1000),
  })
}

export async function getPendingMfaCookie() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(MFA_PENDING_COOKIE_NAME)

  if (!cookie?.value) {
    return null
  }

  return decodePendingMfaState(cookie.value)
}

export async function clearPendingMfaCookie() {
  const cookieStore = await cookies()

  cookieStore.set(MFA_PENDING_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
}

export async function getPendingMfaChallenge() {
  const pendingState = await getPendingMfaCookie()

  if (!pendingState) {
    return null
  }

  const [user] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      name: UsersTable.name,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, pendingState.userId))
    .limit(1)

  if (!user) {
    return null
  }

  const [challenge] = await db
    .select({
      id: VerificationsTable.id,
      expires_at: VerificationsTable.expires_at,
      last_sent_at: VerificationsTable.last_sent_at,
    })
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.id, pendingState.verificationId),
        eq(VerificationsTable.user_id, pendingState.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, pendingState.method),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, new Date())
      )
    )
    .limit(1)

  if (!challenge) {
    return null
  }

  return {
    ...pendingState,
    email: user.email,
    name: user.name,
    maskedEmail: getEmailMfaMask(user.email),
    expiresAt: challenge.expires_at,
    resendAvailableAt: new Date(
      challenge.last_sent_at.getTime() + EMAIL_MFA_RESEND_INTERVAL_MS
    ),
  }
}
