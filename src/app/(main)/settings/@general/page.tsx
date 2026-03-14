import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"
import { GeneralForm } from "./general-form"

export default async function GeneralSlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  return (
    <GeneralForm
      defaultValues={{
        name: session.user.name,
        slug: session.user.slug ?? "",
        email: session.user.email,
      }}
    />
  )
}
