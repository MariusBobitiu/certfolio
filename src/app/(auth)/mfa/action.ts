"use server"

import { redirect } from "next/navigation"
import { actionClient } from "@/lib/safe-action"
import { consumeRateLimit, resetRateLimit } from "@/lib/auth/rate-limit"
import {
  clearPendingMfaCookie,
  consumeRecoveryCodeMfaChallenge,
  getPendingMfaCookie,
  issueEmailMfaChallenge,
  setTrustedMfaDeviceCookie,
  setPendingMfaCookie,
  verifyEmailMfaChallenge,
  verifyTotpMfaChallenge,
} from "@/lib/auth/mfa"
import { createSession, getRequestSessionContext, setSessionCookie } from "@/lib/auth/session"
import { db, UsersTable, VerificationsTable } from "@/lib/db/drizzle"
import { RATE_LIMIT_CONFIG } from "@/lib/consts"
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

    const { ipAddress: requestIpAddress } = await getRequestSessionContext()

    if (requestIpAddress) {
      const ipLimit = await consumeRateLimit({
        scope: "mfa_verify:ip",
        key: requestIpAddress,
        maxAttempts: RATE_LIMIT_CONFIG.MFA.IP_MAX_ATTEMPTS,
        windowMs: RATE_LIMIT_CONFIG.MFA.WINDOW_MS,
      })

      if (!ipLimit.allowed) {
        return { failure: "Too many verification attempts. Try again later." }
      }
    }

    const accountLimit = await consumeRateLimit({
      scope: "mfa_verify:account",
      key: pendingMfa.userId,
      maxAttempts: RATE_LIMIT_CONFIG.MFA.ACCOUNT_MAX_ATTEMPTS,
      windowMs: RATE_LIMIT_CONFIG.MFA.WINDOW_MS,
    })

    if (!accountLimit.allowed) {
      return { failure: "Too many verification attempts. Try again later." }
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

    await resetRateLimit("mfa_verify:account", pendingMfa.userId)
    if (requestIpAddress) {
      await resetRateLimit("mfa_verify:ip", requestIpAddress)
    }

    const { metadata } = result
    const {
      rememberMe = false,
      ipAddress = null,
      city = null,
      userAgent = null,
    } = metadata

    if (parsedInput.rememberDevice) {
      await setTrustedMfaDeviceCookie({
        userId: pendingMfa.userId,
        userAgent,
      })
    }

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
