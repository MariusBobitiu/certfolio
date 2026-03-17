"use server"

import { hash, verify } from "@node-rs/argon2"
import { and, eq, gt, isNull } from "drizzle-orm"
import * as z from "zod/v4"

import { actionClient } from "@/lib/safe-action"
import { getRequestSessionContext } from "@/lib/auth/session"
import {
  db,
  SessionsTable,
  TrustedMfaDevicesTable,
  UsersTable,
} from "@/lib/db/drizzle"

import { resetPasswordSchema } from "./schema"
import {
  clearPasswordResetPendingCookie,
  getPasswordResetPendingCookie,
  logPasswordResetEvent,
} from "@/lib/auth/password-reset"

export const resetPasswordAction = actionClient
  .inputSchema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { password } = parsedInput
    const { ipAddress, userAgent } = await getRequestSessionContext()

    const pending = await getPasswordResetPendingCookie()

    if (!pending) {
      return { failure: "Your password reset session has expired. Please request a new code." }
    }

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, pending.userId))
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
        .where(eq(UsersTable.id, pending.userId))

      await tx
        .update(TrustedMfaDevicesTable)
        .set({ revoked_at: new Date(), updated_at: new Date() })
        .where(
          and(
            eq(TrustedMfaDevicesTable.user_id, pending.userId),
            isNull(TrustedMfaDevicesTable.revoked_at)
          )
        )

      await tx
        .update(SessionsTable)
        .set({ revoked_at: new Date() })
        .where(
          and(
            eq(SessionsTable.user_id, pending.userId),
            isNull(SessionsTable.revoked_at),
            gt(SessionsTable.expires_at, new Date())
          )
        )
    })

    await logPasswordResetEvent(user.id, user.email, "completed", {
      ipAddress,
      userAgent,
    })

    return { success: true as const }
  })

export const finalizeResetPasswordAction = actionClient
  .inputSchema(z.object({}))
  .action(async () => {
    await clearPasswordResetPendingCookie()

    return {
      success: true as const,
      redirectTo: "/sign-in",
    }
  })
