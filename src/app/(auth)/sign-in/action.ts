"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { verify } from "@node-rs/argon2"
import { actionClient } from "@/lib/safe-action"
import { consumeRateLimit, resetRateLimit } from "@/lib/auth/rate-limit"
import { db, UsersTable } from "@/lib/db/drizzle"
import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import {
  createSession,
  getRequestSessionContext,
  setSessionCookie,
} from "@/lib/auth/session"
import { setPendingEmailVerificationCookie } from "@/lib/auth/email-verification"
import {
  getEnabledMfaMethods,
  hasTrustedMfaDevice,
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
        maxAttempts: RATE_LIMIT_CONFIG.SIGN_IN.IP_MAX_ATTEMPTS,
        windowMs: RATE_LIMIT_CONFIG.SIGN_IN.WINDOW_MS,
      })

      if (!ipLimit.allowed) {
        return { failure: "Too many sign-in attempts. Try again later." }
      }
    }

    const accountLimit = await consumeRateLimit({
      scope: "sign_in:account",
      key: normalizedEmail,
      maxAttempts: RATE_LIMIT_CONFIG.SIGN_IN.ACCOUNT_MAX_ATTEMPTS,
      windowMs: RATE_LIMIT_CONFIG.SIGN_IN.WINDOW_MS,
    })

    if (!accountLimit.allowed) {
      return { failure: "Too many sign-in attempts. Try again later." }
    }

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, normalizedEmail))
      .limit(1)

    if (!user || user.deleted_at || user.archived_at) {
      return { failure: "Invalid email or password" }
    }

    const passwordValid = await verify(user.password_hash, password)

    if (!passwordValid) {
      return { failure: "Invalid email or password" }
    }

    await resetRateLimit("sign_in:account", normalizedEmail)
    if (ipAddress) {
      await resetRateLimit("sign_in:ip", ipAddress)
    }

    if (!user.email_verified_at) {
      await setPendingEmailVerificationCookie({
        userId: user.id,
        email: user.email,
      })

      redirect("/verify-email")
    }

    const enabledMfaMethods = await getEnabledMfaMethods(user.id)
    const primaryMfaMethod = enabledMfaMethods[0]
    const trustedDeviceValid =
      enabledMfaMethods.length > 0 ? await hasTrustedMfaDevice(user.id) : false

    if (primaryMfaMethod?.method === "email" && !trustedDeviceValid) {
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

    if (primaryMfaMethod?.method === "totp" && !trustedDeviceValid) {
      const challenge = await issueTotpMfaChallenge({
        userId: user.id,
        email: user.email,
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
