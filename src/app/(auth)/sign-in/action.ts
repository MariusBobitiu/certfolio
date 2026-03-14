"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { verify } from "@node-rs/argon2"
import { actionClient } from "@/lib/safe-action"
import { consumeRateLimit, resetRateLimit } from "@/lib/auth/rate-limit"
import { db, UsersTable } from "@/lib/db/drizzle"
import {
  SIGN_IN_ACCOUNT_RATE_LIMIT_MAX_ATTEMPTS,
  SIGN_IN_IP_RATE_LIMIT_MAX_ATTEMPTS,
  SIGN_IN_RATE_LIMIT_WINDOW_MS,
} from "@/lib/consts"
import {
  createSession,
  getRequestSessionContext,
  setSessionCookie,
} from "@/lib/auth/session"
import {
  getEnabledMfaMethods,
  issueEmailMfaChallenge,
  issueTotpMfaChallenge,
  setPendingMfaCookie,
} from "@/lib/auth/mfa"
import { signInSchema } from "./schema"

export const signInAction = actionClient
  .inputSchema(signInSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, rememberMe } = parsedInput
    const normalizedEmail = email.trim().toLowerCase()
    const { ipAddress, city, userAgent } = await getRequestSessionContext()

    if (ipAddress) {
      const ipLimit = await consumeRateLimit({
        scope: "sign_in:ip",
        key: ipAddress,
        maxAttempts: SIGN_IN_IP_RATE_LIMIT_MAX_ATTEMPTS,
        windowMs: SIGN_IN_RATE_LIMIT_WINDOW_MS,
      })

      if (!ipLimit.allowed) {
        return { failure: "Too many sign-in attempts. Try again later." }
      }
    }

    const accountLimit = await consumeRateLimit({
      scope: "sign_in:account",
      key: normalizedEmail,
      maxAttempts: SIGN_IN_ACCOUNT_RATE_LIMIT_MAX_ATTEMPTS,
      windowMs: SIGN_IN_RATE_LIMIT_WINDOW_MS,
    })

    if (!accountLimit.allowed) {
      return { failure: "Too many sign-in attempts. Try again later." }
    }

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, normalizedEmail))
      .limit(1)

    if (!user) {
      return { failure: "Invalid email or password" }
    }

    if (user.deleted_at) {
      return { failure: "This account has been deleted" }
    }

    if (user.archived_at) {
      return {
        failure:
          "This account has been deactivated. Contact support to reactivate.",
      }
    }

    const passwordValid = await verify(user.password_hash, password)

    if (!passwordValid) {
      return { failure: "Invalid email or password" }
    }

    await resetRateLimit("sign_in:account", normalizedEmail)
    if (ipAddress) {
      await resetRateLimit("sign_in:ip", ipAddress)
    }

    const enabledMfaMethods = await getEnabledMfaMethods(user.id)
    const primaryMfaMethod = enabledMfaMethods[0]

    if (primaryMfaMethod?.method === "email") {
      const challenge = await issueEmailMfaChallenge({
        userId: user.id,
        email: user.email,
        name: user.name,
        rememberMe,
        ipAddress,
        city,
        userAgent,
      })

      await setPendingMfaCookie({
        method: "email",
        userId: user.id,
        verificationId: challenge.verificationId,
      })

      redirect("/mfa")
    }

    if (primaryMfaMethod?.method === "totp") {
      const challenge = await issueTotpMfaChallenge({
        userId: user.id,
        rememberMe,
        ipAddress,
        city,
        userAgent,
      })

      await setPendingMfaCookie({
        method: "totp",
        userId: user.id,
        verificationId: challenge.verificationId,
      })

      redirect("/mfa")
    }

    const { token } = await createSession(user.id, {
      rememberMe,
      ipAddress,
      city,
      userAgent,
    })

    await setSessionCookie(token, rememberMe)

    redirect("/dashboard")
  })
