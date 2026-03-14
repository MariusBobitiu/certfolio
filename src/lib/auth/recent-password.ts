import "server-only"

import { createHmac } from "node:crypto"
import { verify } from "@node-rs/argon2"
import { cookies } from "next/headers"

import {
  RECENT_PASSWORD_CONFIRMATION_COOKIE_NAME,
  RECENT_PASSWORD_CONFIRMATION_TTL_MS,
} from "@/lib/consts"
import type { AuthSession } from "@/lib/auth/session-core"

type RecentPasswordCookie = {
  sessionId: string
  confirmedAt: number
  signature: string
}

function getRecentPasswordKey() {
  const rawKey =
    process.env.MFA_TOTP_ENCRYPTION_KEY ??
    process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

  if (!rawKey) {
    throw new Error(
      "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is required for recent password confirmation."
    )
  }

  return rawKey
}

function signRecentPasswordValue(sessionId: string, confirmedAt: number) {
  return createHmac("sha256", getRecentPasswordKey())
    .update(`${sessionId}:${confirmedAt}`)
    .digest("base64url")
}

function encodeRecentPasswordCookie(sessionId: string, confirmedAt: number) {
  return Buffer.from(
    JSON.stringify({
      sessionId,
      confirmedAt,
      signature: signRecentPasswordValue(sessionId, confirmedAt),
    } satisfies RecentPasswordCookie)
  ).toString("base64url")
}

function decodeRecentPasswordCookie(value: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<RecentPasswordCookie>

    if (
      typeof parsed.sessionId !== "string" ||
      typeof parsed.confirmedAt !== "number" ||
      typeof parsed.signature !== "string"
    ) {
      return null
    }

    return parsed as RecentPasswordCookie
  } catch {
    return null
  }
}

export async function hasRecentPasswordConfirmation(sessionId: string) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(RECENT_PASSWORD_CONFIRMATION_COOKIE_NAME)

  if (!cookie?.value) {
    return false
  }

  const parsed = decodeRecentPasswordCookie(cookie.value)

  if (!parsed || parsed.sessionId !== sessionId) {
    return false
  }

  const expectedSignature = signRecentPasswordValue(
    parsed.sessionId,
    parsed.confirmedAt
  )

  if (expectedSignature !== parsed.signature) {
    return false
  }

  return Date.now() - parsed.confirmedAt <= RECENT_PASSWORD_CONFIRMATION_TTL_MS
}

export async function setRecentPasswordConfirmation(sessionId: string) {
  const cookieStore = await cookies()
  const confirmedAt = Date.now()

  cookieStore.set(
    RECENT_PASSWORD_CONFIRMATION_COOKIE_NAME,
    encodeRecentPasswordCookie(sessionId, confirmedAt),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(RECENT_PASSWORD_CONFIRMATION_TTL_MS / 1000),
    }
  )
}

export async function clearRecentPasswordConfirmation() {
  const cookieStore = await cookies()

  cookieStore.set(RECENT_PASSWORD_CONFIRMATION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
}

export async function requireRecentPasswordConfirmation(
  session: AuthSession,
  password?: string
) {
  if (await hasRecentPasswordConfirmation(session.session.id)) {
    return { success: true as const }
  }

  if (!password) {
    return {
      success: false as const,
      requiresPasswordConfirmation: true as const,
      failure: "Confirm your password to continue.",
    }
  }

  const valid = await verify(session.user.password_hash, password)

  if (!valid) {
    return {
      success: false as const,
      requiresPasswordConfirmation: true as const,
      failure: "Current password is incorrect.",
    }
  }

  await setRecentPasswordConfirmation(session.session.id)

  return { success: true as const }
}
