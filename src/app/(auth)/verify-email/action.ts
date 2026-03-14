"use server"

import { eq } from "drizzle-orm"
import * as z from "zod/v4"

import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import { consumeRateLimit } from "@/lib/auth/rate-limit"
import { getRequestSessionContext } from "@/lib/auth/session"
import {
  getPendingEmailVerificationCookie,
  sendEmailVerification,
} from "@/lib/auth/email-verification"
import { actionClient } from "@/lib/safe-action"
import { db, UsersTable } from "@/lib/db/drizzle"

const resendVerificationSchema = z.object({
  email: z.email("Enter a valid email address."),
})

export const resendVerificationEmailAction = actionClient
  .inputSchema(resendVerificationSchema)
  .action(async ({ parsedInput }) => {
    const normalizedEmail = parsedInput.email.trim().toLowerCase()
    const { ipAddress } = await getRequestSessionContext()
    const pendingVerification = await getPendingEmailVerificationCookie()

    if (
      pendingVerification &&
      pendingVerification.email.toLowerCase() !== normalizedEmail
    ) {
      return {
        failure: "Enter the email address associated with this verification request.",
      }
    }

    if (ipAddress) {
      const ipLimit = await consumeRateLimit({
        scope: "email_verification:ip",
        key: ipAddress,
        maxAttempts: RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.IP_MAX_ATTEMPTS,
        windowMs: RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.WINDOW_MS,
      })

      if (!ipLimit.allowed) {
        return {
          failure: "Too many verification email requests. Try again later.",
        }
      }
    }

    const accountLimit = await consumeRateLimit({
      scope: "email_verification:account",
      key: normalizedEmail,
      maxAttempts: RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.ACCOUNT_MAX_ATTEMPTS,
      windowMs: RATE_LIMIT_CONFIG.EMAIL_VERIFICATION.WINDOW_MS,
    })

    if (!accountLimit.allowed) {
      return {
        failure: "Too many verification email requests. Try again later.",
      }
    }

    const [user] = await db
      .select({
        id: UsersTable.id,
        email: UsersTable.email,
        name: UsersTable.name,
        email_verified_at: UsersTable.email_verified_at,
      })
      .from(UsersTable)
      .where(eq(UsersTable.email, normalizedEmail))
      .limit(1)

    if (user && !user.email_verified_at) {
      try {
        await sendEmailVerification({
          userId: user.id,
          email: user.email,
          name: user.name,
        })
      } catch (error) {
        console.error("Failed to resend verification email:", error)
        return {
          failure:
            "We could not resend the verification email right now. Please try again.",
        }
      }
    }

    return {
      success: "Verification email sent. Check your inbox for a new link.",
    }
  })
