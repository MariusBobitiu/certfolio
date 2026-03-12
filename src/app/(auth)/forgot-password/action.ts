"use server"

import { eq } from "drizzle-orm"

import { actionClient } from "@/lib/safe-action"
import { sendPasswordResetEmail } from "@/lib/auth/password-reset"
import { db, UsersTable } from "@/lib/db/drizzle"

import { forgotPasswordSchema } from "./schema"

export const forgotPasswordAction = actionClient
  .inputSchema(forgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput

    const normalizedEmail = email.toLowerCase().trim()

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
