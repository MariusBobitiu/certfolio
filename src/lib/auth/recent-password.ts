import "server-only"

import { verify } from "@node-rs/argon2"

import { RECENT_PASSWORD_CONFIRMATION_CONFIG } from "@/lib/consts"
import {
  markSessionReauthenticated,
  type AuthSession,
} from "@/lib/auth/session-core"

export async function hasRecentPasswordConfirmation(session: AuthSession) {
  const confirmedAt = session.session.reauthenticated_at?.getTime()

  if (!confirmedAt) {
    return false
  }

  return Date.now() - confirmedAt <= RECENT_PASSWORD_CONFIRMATION_CONFIG.TTL_MS
}

export async function requireRecentPasswordConfirmation(
  session: AuthSession,
  password?: string
) {
  if (await hasRecentPasswordConfirmation(session)) {
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

  await markSessionReauthenticated(session.session.id)

  return { success: true as const }
}
