"use server"

import { eq } from "drizzle-orm"
import { actionClient } from "@/lib/safe-action"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UserPreferencesTable } from "@/lib/db/drizzle"
import { updateAppearanceSchema } from "./schema"

export const updateAppearanceAction = actionClient
  .inputSchema(updateAppearanceSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    await db
      .insert(UserPreferencesTable)
      .values({
        user_id: session.user.id,
        accent_colour: parsedInput.accent_colour,
      })
      .onConflictDoUpdate({
        target: UserPreferencesTable.user_id,
        set: {
          accent_colour: parsedInput.accent_colour,
          updated_at: new Date(),
        },
      })

    return { success: "Appearance updated" }
  })
