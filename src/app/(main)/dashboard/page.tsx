import { Metadata } from "next"
import { redirect } from "next/navigation"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { getDashboardData } from "@/data/dashboard"
import { getCurrentSession } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Dashboard - Certfolio",
  description:
    "See the health of your Certfolio profile, credentials, projects, and evidence at a glance.",
  authors: [
    {
      name: "Marius Bobitiu",
      url: "https://mariusbobitiu.dev",
    },
  ],
}

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/sign-in")
  }

  const data = await getDashboardData(session.user.id)

  return <DashboardOverview name={session.user.name} data={data} />
}
