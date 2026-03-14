"use server"

import { hash, verify } from "@node-rs/argon2"
import { and, eq, gt, isNull } from "drizzle-orm"
import * as z from "zod/v4"

import { actionClient } from "@/lib/safe-action"
import {
  db,
  SessionsTable,
  TrustedMfaDevicesTable,
  UsersTable,
  VerificationsTable,
} from "@/lib/db/drizzle"

import { resetPasswordSchema } from "./schema"
import {
  logPasswordResetEvent,
  validatePasswordResetToken,
} from "@/lib/auth/password-reset"

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

    await db.transaction(async (tx) => {
      await tx
        .update(UsersTable)
        .set({ password_hash: passwordHash, updated_at: new Date() })
        .where(eq(UsersTable.id, result.userId))

      await tx
        .update(TrustedMfaDevicesTable)
        .set({ revoked_at: new Date(), updated_at: new Date() })
        .where(
          and(
            eq(TrustedMfaDevicesTable.user_id, result.userId),
            isNull(TrustedMfaDevicesTable.revoked_at)
          )
        )

      await tx
        .update(SessionsTable)
        .set({ revoked_at: new Date() })
        .where(
          and(
            eq(SessionsTable.user_id, result.userId),
            isNull(SessionsTable.revoked_at),
            gt(SessionsTable.expires_at, new Date())
          )
        )

      await tx
        .update(VerificationsTable)
        .set({ consumed_at: new Date() })
        .where(eq(VerificationsTable.id, result.verificationId))
    })

    await logPasswordResetEvent(user.id, user.email, "completed")

    return { success: true as const }
  })
