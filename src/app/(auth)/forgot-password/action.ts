"use server"

import { eq } from "drizzle-orm"

import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import { consumeRateLimit } from "@/lib/auth/rate-limit"
import { actionClient } from "@/lib/safe-action"
import { getRequestSessionContext } from "@/lib/auth/session"
import {
  clearPasswordResetPendingCookie,
  consumePasswordResetToken,
  logPasswordResetEvent,
  sendPasswordResetEmail,
  setPasswordResetPendingCookie,
  validatePasswordResetCode,
} from "@/lib/auth/password-reset"
import { db, UsersTable } from "@/lib/db/drizzle"

import { forgotPasswordSchema, verifyForgotPasswordCodeSchema } from "./schema"

export const forgotPasswordAction = actionClient
  .inputSchema(forgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput

    const normalizedEmail = email.toLowerCase().trim()
    const { ipAddress, userAgent } = await getRequestSessionContext()

    if (ipAddress) {
      const ipLimit = await consumeRateLimit({
        scope: "forgot_password:ip",
        key: ipAddress,
        maxAttempts: RATE_LIMIT_CONFIG.FORGOT_PASSWORD.IP_MAX_ATTEMPTS,
        windowMs: RATE_LIMIT_CONFIG.FORGOT_PASSWORD.WINDOW_MS,
      })

      if (!ipLimit.allowed) {
        return {
          failure: "Too many password reset attempts. Try again later.",
        }
      }
    }

    const accountLimit = await consumeRateLimit({
      scope: "forgot_password:account",
      key: normalizedEmail,
      maxAttempts: RATE_LIMIT_CONFIG.FORGOT_PASSWORD.ACCOUNT_MAX_ATTEMPTS,
      windowMs: RATE_LIMIT_CONFIG.FORGOT_PASSWORD.WINDOW_MS,
    })

    if (!accountLimit.allowed) {
      return {
        failure: "Too many password reset attempts. Try again later.",
      }
    }

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, normalizedEmail))
      .limit(1)

    if (!user) {
      // For security, we don't reveal whether email exists
      await clearPasswordResetPendingCookie()
      return {
        success:
          "If an account is registered using that email address, you should receive a code.",
      }
    }

    try {
      await sendPasswordResetEmail({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
      await logPasswordResetEvent(user.id, user.email, "requested", {
        ipAddress,
        userAgent,
      })
      await clearPasswordResetPendingCookie()
    } catch (error) {
      console.error("Failed to send password reset email:", error)
      return {
        failure: "We could not send a password reset email right now. Please try again.",
      }
    }

    return {
      success:
        "If an account is registered using that email address, you should receive a code.",
    }
  })

export const verifyForgotPasswordCodeAction = actionClient
  .inputSchema(verifyForgotPasswordCodeSchema)
  .action(async ({ parsedInput }) => {
    const normalizedEmail = parsedInput.email.toLowerCase().trim()
    const normalizedCode = parsedInput.code.replace(/-/g, "")

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, normalizedEmail))
      .limit(1)

    if (!user) {
      return {
        failure: "The code you entered is incorrect or has expired.",
      }
    }

    const result = await validatePasswordResetCode(user.id, normalizedCode)

    if (!result.success) {
      return {
        failure: "The code you entered is incorrect or has expired.",
      }
    }

    await consumePasswordResetToken(result.verificationId)
    await setPasswordResetPendingCookie(result.userId)

    return {
      success: true as const,
      redirectTo: "/reset-password",
    }
  })
