"use server"

import { and, eq, ne } from "drizzle-orm"
import { actionClient } from "@/lib/safe-action"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UsersTable } from "@/lib/db/drizzle"
import { updateProfileSchema } from "./schema"

export const updateProfileAction = actionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const { name, slug, email } = parsedInput

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
      .where(
        and(eq(UsersTable.email, email), ne(UsersTable.id, session.user.id))
      )
      .limit(1)

    if (existingEmail) {
      return { failure: "Email is already in use" }
    }

    await db
      .update(UsersTable)
      .set({ name, slug, email, updated_at: new Date() })
      .where(eq(UsersTable.id, session.user.id))

    return { success: "Profile updated" }
  })
