"use server"

import { and, desc, eq, gt, isNull, ne } from "drizzle-orm"
import { hash, verify } from "@node-rs/argon2"
import { actionClient } from "@/lib/safe-action"
import { getCurrentSession, revokeSessionById } from "@/lib/auth/session"
import {
  disableEmailMfaMethod,
  enableEmailMfaMethod,
  getMfaMethodSummary,
} from "@/lib/auth/mfa"
import { validatePassword } from "@/lib/auth/password-validation"
import { db, SessionsTable, UsersTable } from "@/lib/db/drizzle"
import { changePasswordSchema, revokeSessionSchema } from "./schema"

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

    await db
      .update(UsersTable)
      .set({ password_hash: newHash, updated_at: new Date() })
      .where(eq(UsersTable.id, session.user.id))

    return { success: "Password changed" }
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

export const enableEmailMfaAction = actionClient.action(async () => {
  const session = await getCurrentSession()
  if (!session) return { failure: "Unauthorized" }

  await enableEmailMfaMethod(session.user.id)

  return { success: "Email MFA enabled" }
})

export const disableEmailMfaAction = actionClient.action(async () => {
  const session = await getCurrentSession()
  if (!session) return { failure: "Unauthorized" }

  await disableEmailMfaMethod(session.user.id)

  return { success: "Email MFA disabled" }
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
      created_at: VerificationsTable.created_at,
    })
    .from(VerificationsTable)
    .where(eq(VerificationsTable.user_id, userId))
    .orderBy(desc(VerificationsTable.created_at))
    .limit(5)

  const recentSessions = await db
    .select({
      created_at: SessionsTable.created_at,
    })
    .from(SessionsTable)
    .where(eq(SessionsTable.user_id, userId))
    .orderBy(desc(SessionsTable.created_at))
    .limit(3)

  const LABEL_MAP: Record<string, string> = {
    email_verification: "Email verified",
    password_reset: "Password reset",
    sign_in_otp: "Signed in via OTP",
    mfa_challenge: "MFA challenge completed",
    mfa_enrollment: "MFA method enrolled",
  }

  const events = [
    ...recentVerifications.map((v) => ({
      label: LABEL_MAP[v.type] ?? v.type,
      timestamp: v.created_at,
    })),
    ...recentSessions.map((s) => ({
      label: "Signed in",
      timestamp: s.created_at,
    })),
  ]

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return events.slice(0, 5)
}
