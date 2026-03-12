"use server"

import { hash, verify } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import * as z from "zod/v4"

import { actionClient } from "@/lib/safe-action"
import { db, UsersTable } from "@/lib/db/drizzle"

import { resetPasswordSchema } from "./schema"
import { validatePasswordResetToken, consumePasswordResetToken } from "@/lib/auth/password-reset"

const resetPasswordWithTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  ...resetPasswordSchema.shape,
})

export const resetPasswordAction = actionClient
  .inputSchema(resetPasswordWithTokenSchema)
  .action(async ({ parsedInput }) => {
    const { password, token } = parsedInput

    const result = await validatePasswordResetToken(token)

    if (!result.success) {
      return { failure: "Your password reset link has expired or is invalid." }
    }

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, result.userId))
      .limit(1)

    if (!user) {
      return { failure: "User not found." }
    }

    const oldPasswordMatches = await verify(user.password_hash, password)

    if (oldPasswordMatches) {
      return { failure: "Your new password cannot be the same as your old password." }
    }

    const passwordHash = await hash(password)

    await db
      .update(UsersTable)
      .set({ password_hash: passwordHash })
      .where(eq(UsersTable.id, result.userId))

    await consumePasswordResetToken(result.verificationId)

    return { success: true as const }
  })
