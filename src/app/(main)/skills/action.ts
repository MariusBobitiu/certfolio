"use server"

import { revalidatePath } from "next/cache"
import { asc, eq } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import { db, SkillsTable } from "@/lib/db/drizzle"
import { actionClient } from "@/lib/safe-action"

import { saveSkillsSchema } from "./schema"

export const saveSkillsAction = actionClient
  .inputSchema(saveSkillsSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) {
      return { failure: "Unauthorized" }
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(SkillsTable)
        .where(eq(SkillsTable.user_id, session.user.id))

      if (parsedInput.skills.length > 0) {
        await tx.insert(SkillsTable).values(
          parsedInput.skills.map((skill, index) => ({
            user_id: session.user.id,
            name: skill.name.trim(),
            category: skill.category,
            sort_order: index,
          }))
        )
      }
    })

    const skills = await db
      .select({
        id: SkillsTable.id,
        name: SkillsTable.name,
        category: SkillsTable.category,
      })
      .from(SkillsTable)
      .where(eq(SkillsTable.user_id, session.user.id))
      .orderBy(asc(SkillsTable.sort_order))

    revalidatePath("/skills")
    if (session.user.slug) {
      revalidatePath(`/u/${session.user.slug}`)
    }

    return { success: "Skills saved", skills }
  })
