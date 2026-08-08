import { Metadata } from "next"
import { redirect } from "next/navigation"
import { asc, eq } from "drizzle-orm"

import { SkillsWorkspace } from "@/components/skills/skills-workspace"
import { getCurrentSession } from "@/lib/auth/session"
import { db, SkillsTable } from "@/lib/db/drizzle"

export const metadata: Metadata = {
  title: "Skills - Certfolio",
  description:
    "Manage the self-declared skills shown on your public Certfolio profile.",
}

export default async function SkillsPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/sign-in")
  }

  const skills = await db
    .select({
      id: SkillsTable.id,
      name: SkillsTable.name,
      category: SkillsTable.category,
    })
    .from(SkillsTable)
    .where(eq(SkillsTable.user_id, session.user.id))
    .orderBy(asc(SkillsTable.sort_order))

  return <SkillsWorkspace initialSkills={skills} />
}
