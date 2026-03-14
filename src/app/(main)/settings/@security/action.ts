"use server"

import { and, desc, eq, gt, isNull, ne } from "drizzle-orm"
import { hash, verify } from "@node-rs/argon2"
import { actionClient } from "@/lib/safe-action"
import { requireRecentPasswordConfirmation } from "@/lib/auth/recent-password"
import { getCurrentSession, revokeSessionById } from "@/lib/auth/session"
import {
  beginTotpEnrollment,
  confirmTotpEnrollment,
  disableEmailMfaMethod,
  disableTotpMfaMethod,
  enableEmailMfaMethod,
  getMfaMethodSummary,
  generateRecoveryCodes,
  revokeTrustedMfaDevices,
} from "@/lib/auth/mfa"
import { validatePassword } from "@/lib/auth/password-validation"
import { db, SessionsTable, UsersTable } from "@/lib/db/drizzle"
import {
  changePasswordSchema,
  revokeSessionSchema,
  sensitiveActionSchema,
  totpCodeSchema,
} from "./schema"

export const changePasswordAction = actionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const { currentPassword, newPassword } = parsedInput

    const passwordValid = await verify(
      session.user.password_hash,
      currentPassword
    )
    if (!passwordValid) {
      return { failure: "Current password is incorrect" }
    }

    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      return { failure: `Password must have: ${validation.errors.join(", ")}` }
    }

    const newHash = await hash(newPassword)

    await db.transaction(async (tx) => {
      await tx
        .update(UsersTable)
        .set({ password_hash: newHash, updated_at: new Date() })
        .where(eq(UsersTable.id, session.user.id))

      await tx
        .update(SessionsTable)
        .set({ revoked_at: new Date() })
        .where(
          and(
            eq(SessionsTable.user_id, session.user.id),
            ne(SessionsTable.id, session.session.id),
            isNull(SessionsTable.revoked_at),
            gt(SessionsTable.expires_at, new Date())
          )
        )
    })

    await revokeTrustedMfaDevices(session.user.id)

    return { success: "Password changed and other sessions revoked" }
  })

export const revokeSessionAction = actionClient
  .inputSchema(revokeSessionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    // Prevent revoking own session through this action
    if (parsedInput.sessionId === session.session.id) {
      return { failure: "Cannot revoke your current session" }
    }

    // Verify the session belongs to the current user
    const [targetSession] = await db
      .select({ id: SessionsTable.id })
      .from(SessionsTable)
      .where(
        and(
          eq(SessionsTable.id, parsedInput.sessionId),
          eq(SessionsTable.user_id, session.user.id)
        )
      )
      .limit(1)

    if (!targetSession) {
      return { failure: "Session not found" }
    }

    await revokeSessionById(parsedInput.sessionId)

    return { success: "Session revoked" }
  })

export const revokeAllOtherSessionsAction = actionClient.action(async () => {
  const session = await getCurrentSession()
  if (!session) return { failure: "Unauthorized" }

  await db
    .update(SessionsTable)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(SessionsTable.user_id, session.user.id),
        ne(SessionsTable.id, session.session.id),
        isNull(SessionsTable.revoked_at),
        gt(SessionsTable.expires_at, new Date())
      )
    )

  return { success: "All other sessions revoked" }
})

export const enableEmailMfaAction = actionClient
  .inputSchema(sensitiveActionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    await enableEmailMfaMethod(session.user.id)

    return { success: "Email MFA enabled" }
  })

export const disableEmailMfaAction = actionClient
  .inputSchema(sensitiveActionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    await disableEmailMfaMethod(session.user.id)

    return { success: "Email MFA disabled" }
  })

export const beginTotpEnrollmentAction = actionClient
  .inputSchema(sensitiveActionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    const result = await beginTotpEnrollment({
      userId: session.user.id,
      email: session.user.email,
    })

    if (!result.success) {
      return { failure: result.failure }
    }

    return {
      success: "Authenticator app setup started",
      secret: result.secret,
      otpauthUrl: result.otpauthUrl,
      issuer: result.issuer,
      accountName: result.accountName,
    }
  })

export const confirmTotpEnrollmentAction = actionClient
  .inputSchema(totpCodeSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    const result = await confirmTotpEnrollment({
      userId: session.user.id,
      code: parsedInput.code,
    })

    if (!result.success) {
      return { failure: result.failure }
    }

    return {
      success: "Authenticator app MFA enabled",
      recoveryCodes: result.recoveryCodes,
    }
  })

export const disableTotpMfaAction = actionClient
  .inputSchema(sensitiveActionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    await disableTotpMfaMethod(session.user.id)

    return { success: "Authenticator app MFA disabled" }
  })

export const regenerateRecoveryCodesAction = actionClient
  .inputSchema(sensitiveActionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    const summary = await getMfaMethodSummary(session.user.id)

    if (!summary.totpEnabled) {
      return {
        failure:
          "Enable authenticator app MFA before generating recovery codes.",
      }
    }

    const recoveryCodes = await generateRecoveryCodes(session.user.id)

    return {
      success: "Recovery codes regenerated",
      recoveryCodes,
    }
  })

export async function getActiveSessions(userId: string) {
  return db
    .select()
    .from(SessionsTable)
    .where(
      and(
        eq(SessionsTable.user_id, userId),
        isNull(SessionsTable.revoked_at),
        gt(SessionsTable.expires_at, new Date())
      )
    )
    .orderBy(desc(SessionsTable.last_seen_at))
}

export async function getMfaSummary(userId: string) {
  return getMfaMethodSummary(userId)
}

export async function getRecentSecurityActivity(userId: string) {
  const { VerificationsTable } = await import("@/lib/db/drizzle")

  const recentVerifications = await db
    .select({
      type: VerificationsTable.purpose,
      method: VerificationsTable.method,
      metadata: VerificationsTable.metadata,
      created_at: VerificationsTable.created_at,
      consumed_at: VerificationsTable.consumed_at,
    })
    .from(VerificationsTable)
    .where(eq(VerificationsTable.user_id, userId))
    .orderBy(desc(VerificationsTable.created_at))
    .limit(10)

  const recentSessions = await db
    .select({
      created_at: SessionsTable.created_at,
    })
    .from(SessionsTable)
    .where(eq(SessionsTable.user_id, userId))
    .orderBy(desc(SessionsTable.created_at))
    .limit(5)

  const LABEL_MAP: Record<string, string> = {
    email_verification: "Email verified",
    password_reset: "Password reset",
    sign_in_otp: "Signed in via OTP",
    mfa_enrollment: "MFA method enrolled",
    mfa_disabled: "MFA method disabled",
    recovery_code_used: "Signed in with a recovery code",
    recovery_codes_regenerated: "Recovery codes regenerated",
  }

  const MFA_METHOD_LABELS: Record<string, string> = {
    email: "Email One-Time Code",
    totp: "Authenticator App",
  }

  const recentMfaChallenges = recentVerifications.filter(
    (verification) =>
      verification.type === "mfa_challenge" && Boolean(verification.consumed_at)
  )

  const events = [
    ...recentVerifications.map((verification) => ({
      label: (() => {
        const event = verification.metadata?.event

        if (verification.type === "email_verification") {
          if (event === "sent") {
            return verification.metadata?.source === "resend"
              ? "Verification email re-sent"
              : "Verification email sent"
          }

          if (event === "verified") {
            return "Email verified"
          }
        }

        if (verification.type === "password_reset") {
          if (event === "requested") {
            return "Password reset requested"
          }

          if (event === "completed") {
            return "Password reset completed"
          }
        }

        if (verification.type === "mfa_challenge") {
          return verification.consumed_at
            ? `Signed in using ${
                MFA_METHOD_LABELS[verification.method] ?? verification.method
              }`
            : "MFA challenge started"
        }

        if (verification.type === "mfa_enrollment") {
          return `${MFA_METHOD_LABELS[verification.method] ?? verification.method} enabled`
        }

        if (verification.type === "mfa_disabled") {
          return `${MFA_METHOD_LABELS[verification.method] ?? verification.method} disabled`
        }

        return LABEL_MAP[verification.type] ?? verification.type
      })(),
      timestamp: verification.consumed_at ?? verification.created_at,
    })),
    ...recentSessions.map((s) => ({
      label: recentMfaChallenges.some((verification) => {
        if (!verification.consumed_at) {
          return false
        }

        const deltaMs = Math.abs(
          s.created_at.getTime() - verification.consumed_at.getTime()
        )

        return deltaMs <= 1000 * 30
      })
        ? "Sign in attempt"
        : "Signed in",
      timestamp: s.created_at,
    })),
  ]

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return events.slice(0, 5)
}
