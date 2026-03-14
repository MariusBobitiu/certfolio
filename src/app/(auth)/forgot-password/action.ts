"use server"

import { eq } from "drizzle-orm"

import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import { consumeRateLimit } from "@/lib/auth/rate-limit"
import { actionClient } from "@/lib/safe-action"
import { getRequestSessionContext } from "@/lib/auth/session"
import { sendPasswordResetEmail } from "@/lib/auth/password-reset"
import { db, UsersTable } from "@/lib/db/drizzle"

import { forgotPasswordSchema } from "./schema"

export const forgotPasswordAction = actionClient
  .inputSchema(forgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput

    const normalizedEmail = email.toLowerCase().trim()
    const { ipAddress } = await getRequestSessionContext()

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
      return {
        success:
          "If an account exists with this email, we will send you a password reset link.",
      }
    }

    try {
      await sendPasswordResetEmail({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
    } catch (error) {
      console.error("Failed to send password reset email:", error)
      return {
        failure: "We could not send a password reset email right now. Please try again.",
      }
    }

    return {
      success:
        "If an account exists with this email, we will send you a password reset link.",
    }
  })
