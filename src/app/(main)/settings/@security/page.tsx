import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"
import {
  getActiveSessions,
  getRecentSecurityActivity,
} from "./action"
import { SecuritySection } from "./security-section"

export default async function SecuritySlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  const [sessions, activity] = await Promise.all([
    getActiveSessions(session.user.id),
    getRecentSecurityActivity(session.user.id),
  ])

  return (
    <SecuritySection
      currentSessionId={session.session.id}
      sessions={sessions}
      recentActivity={activity}
    />
  )
}
