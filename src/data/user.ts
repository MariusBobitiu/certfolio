"use server"

import { db, UsersTable } from "@/lib/db/drizzle"
import { eq } from "drizzle-orm"

export const getUserBySlug = async (slug: string) => {
  // Sanitize the slug to prevent SQL injection
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "")

  try {
    const user = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.slug, sanitizedSlug))
      .limit(1)
      .then((rows) => rows[0]) // Get the first user from the result

    return user
  } catch (error) {
    console.error("Error fetching user by slug:", error)
    throw error
  }
}
