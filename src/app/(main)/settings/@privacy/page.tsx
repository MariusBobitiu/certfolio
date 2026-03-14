import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UserPreferencesTable } from "@/lib/db/drizzle"
import { PrivacyForm } from "./privacy-form"

export default async function PrivacySlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  const [prefs] = await db
    .select()
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, session.user.id))
    .limit(1)

  return (
    <PrivacyForm
      defaultValues={{
        public_profile: prefs?.public_profile ?? true,
        searchable: prefs?.searchable ?? true,
        show_email: prefs?.show_email ?? false,
        full_metadata: prefs?.full_metadata ?? true,
      }}
    />
  )
}
