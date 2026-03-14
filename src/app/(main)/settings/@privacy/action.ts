"use server"

import { actionClient } from "@/lib/safe-action"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UserPreferencesTable } from "@/lib/db/drizzle"
import { updatePrivacySchema } from "./schema"

export const updatePrivacyAction = actionClient
  .inputSchema(updatePrivacySchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    await db
      .insert(UserPreferencesTable)
      .values({
        user_id: session.user.id,
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: UserPreferencesTable.user_id,
        set: {
          ...parsedInput,
          updated_at: new Date(),
        },
      })

    return { success: "Privacy settings updated" }
  })
