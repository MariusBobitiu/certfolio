import { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentSession } from "@/lib/auth/session"
import { getProfileManagementData } from "@/data/profile-management"
import { ProfileWorkspace } from "@/components/profile/profile-workspace"

export const metadata: Metadata = {
  title: "Profile — Certfolio",
  description:
    "Curate your public Certfolio profile. Manage your identity, featured credentials, and projects.",
}

export default async function ProfilePage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/sign-in")
  }

  const data = await getProfileManagementData(session.user.id)

  return <ProfileWorkspace data={data} />
}
