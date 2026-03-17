import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth/session"
import { db, UserPreferencesTable } from "@/lib/db/drizzle"
import { GeneralForm } from "./general-form"
import { BioForm } from "./bio-form"

export default async function GeneralSlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  const [prefs] = await db
    .select({ bio: UserPreferencesTable.bio })
    .from(UserPreferencesTable)
    .where(eq(UserPreferencesTable.user_id, session.user.id))
    .limit(1)

  return (
    <div className="space-y-10">
      <GeneralForm
        defaultValues={{
          name: session.user.name,
          slug: session.user.slug ?? "",
          email: session.user.email,
        }}
      />

      <div className="border-t border-border/60 pt-10 dark:border-white/8">
        <BioForm defaultBio={prefs?.bio ?? ""} />
      </div>
    </div>
  )
}
