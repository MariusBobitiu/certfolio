import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UserPreferencesTable } from "@/lib/db/drizzle"
import { AppearanceForm } from "./appearance-form"
import type { ACCENT_COLOURS } from "./schema"

export default async function AppearanceSlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  const [prefs] = await db
    .select()
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, session.user.id))
    .limit(1)

  return (
    <AppearanceForm
      currentColour={
        (prefs?.accent_colour as (typeof ACCENT_COLOURS)[number]) ?? "blue"
      }
    />
  )
}
