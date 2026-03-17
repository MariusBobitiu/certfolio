"use server"

import * as z from "zod/v4"
import { actionClient } from "@/lib/safe-action"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UserPreferencesTable } from "@/lib/db/drizzle"

const updateBioSchema = z.object({
  bio: z.string().max(500, "Bio must be 500 characters or fewer"),
})

export const updateBioAction = actionClient
  .inputSchema(updateBioSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    await db
      .insert(UserPreferencesTable)
      .values({
        user_id: session.user.id,
        bio: parsedInput.bio,
      })
      .onConflictDoUpdate({
        target: UserPreferencesTable.user_id,
        set: {
          bio: parsedInput.bio,
          updated_at: new Date(),
        },
      })

    return { success: "Bio updated" }
  })
