import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"
import { DataClient } from "./data-client"

export default async function DataSlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  return <DataClient userEmail={session.user.email} />
}
