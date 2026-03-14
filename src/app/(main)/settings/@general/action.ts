"use server"

import { and, eq, ne } from "drizzle-orm"
import {
  logEmailVerificationSentEvent,
  sendEmailVerification,
} from "@/lib/auth/email-verification"
import { requireRecentPasswordConfirmation } from "@/lib/auth/recent-password"
import { actionClient } from "@/lib/safe-action"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UsersTable } from "@/lib/db/drizzle"
import { updateProfileSchema } from "./schema"

export const updateProfileAction = actionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const { name, slug, email, password } = parsedInput
    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedEmail !== session.user.email) {
      const confirmation = await requireRecentPasswordConfirmation(
        session,
        password
      )

      if (!confirmation.success) {
        return confirmation
      }
    }

    // Check slug uniqueness (excluding current user)
    const [existingSlug] = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(and(eq(UsersTable.slug, slug), ne(UsersTable.id, session.user.id)))
      .limit(1)

    if (existingSlug) {
      return { failure: "Username is already taken" }
    }

    // Check email uniqueness (excluding current user)
    const [existingEmail] = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(and(eq(UsersTable.email, normalizedEmail), ne(UsersTable.id, session.user.id)))
      .limit(1)

    if (existingEmail) {
      return { failure: "Email is already in use" }
    }

    await db
      .update(UsersTable)
      .set({
        name,
        slug,
        email: normalizedEmail,
        email_verified_at:
          normalizedEmail !== session.user.email
            ? null
            : session.user.email_verified_at,
        updated_at: new Date(),
      })
      .where(eq(UsersTable.id, session.user.id))

    if (normalizedEmail !== session.user.email) {
      await sendEmailVerification({
        userId: session.user.id,
        email: normalizedEmail,
        name: name,
      })
      await logEmailVerificationSentEvent(
        session.user.id,
        normalizedEmail,
        "resend"
      )
    }

    return {
      success:
        normalizedEmail !== session.user.email
          ? "Profile updated. Please verify your new email address."
          : "Profile updated",
    }
  })
