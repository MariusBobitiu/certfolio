"use server"

import { redirect } from "next/navigation"
import { actionClient } from "@/lib/safe-action"
import {
  clearPendingMfaCookie,
  consumeRecoveryCodeMfaChallenge,
  getPendingMfaCookie,
  issueEmailMfaChallenge,
  setPendingMfaCookie,
  verifyEmailMfaChallenge,
  verifyTotpMfaChallenge,
} from "@/lib/auth/mfa"
import { createSession, setSessionCookie } from "@/lib/auth/session"
import { db, UsersTable, VerificationsTable } from "@/lib/db/drizzle"
import { and, eq } from "drizzle-orm"
import { verifyMfaCodeSchema } from "./schema"

export const verifyMfaCodeAction = actionClient
  .inputSchema(verifyMfaCodeSchema)
  .action(async ({ parsedInput }) => {
    const pendingMfa = await getPendingMfaCookie()

    if (!pendingMfa) {
      return {
        failure: "Your verification session has expired. Sign in again.",
      }
    }

    const result =
      pendingMfa.method === "email"
        ? await verifyEmailMfaChallenge({
            verificationId: pendingMfa.verificationId,
            userId: pendingMfa.userId,
            code: parsedInput.code,
          })
        : parsedInput.codeType === "recovery"
          ? await consumeRecoveryCodeMfaChallenge({
              verificationId: pendingMfa.verificationId,
              userId: pendingMfa.userId,
              code: parsedInput.code,
            })
          : await verifyTotpMfaChallenge({
              verificationId: pendingMfa.verificationId,
              userId: pendingMfa.userId,
              code: parsedInput.code,
            })

    if (!result.success) {
      return { failure: result.failure }
    }

    const { metadata } = result
    const {
      rememberMe = false,
      ipAddress = null,
      city = null,
      userAgent = null,
    } = metadata

    const { token } = await createSession(pendingMfa.userId, {
      rememberMe,
      ipAddress,
      city,
      userAgent,
    })

    await setSessionCookie(token, rememberMe)
    await clearPendingMfaCookie()

    redirect("/dashboard")
  })

export const resendMfaCodeAction = actionClient.action(async () => {
  const pendingMfa = await getPendingMfaCookie()

  if (!pendingMfa || pendingMfa.method !== "email") {
    return { failure: "Your verification session has expired. Sign in again." }
  }

  const [user] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      name: UsersTable.name,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, pendingMfa.userId))
    .limit(1)

  if (!user) {
    await clearPendingMfaCookie()
    return { failure: "Your verification session has expired. Sign in again." }
  }

  const [verification] = await db
    .select({
      metadata: VerificationsTable.metadata,
    })
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.id, pendingMfa.verificationId),
        eq(VerificationsTable.user_id, pendingMfa.userId)
      )
    )
    .limit(1)

  const metadata = (verification?.metadata ?? {}) as {
    rememberMe?: boolean
    ipAddress?: string | null
    city?: string | null
    userAgent?: string | null
  }

  const challenge = await issueEmailMfaChallenge({
    userId: user.id,
    email: user.email,
    name: user.name,
    rememberMe: metadata.rememberMe ?? false,
    ipAddress: metadata.ipAddress ?? null,
    city: metadata.city ?? null,
    userAgent: metadata.userAgent ?? null,
  })

  if (!challenge.sent) {
    return {
      failure: `A code was already sent. Try again after ${challenge.resendAvailableAt.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}.`,
    }
  }

  await setPendingMfaCookie({
    method: "email",
    userId: user.id,
    verificationId: challenge.verificationId,
  })

  return { success: "A new code has been sent." }
})
