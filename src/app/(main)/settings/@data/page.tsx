import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"
import { DeactivateSection, DeleteSection, ExportSection } from "./data-client"
import { Separator } from "@/components/ui/separator"

export default async function DataSlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Data & Account</h2>
        <p className="text-sm text-muted-foreground">
          Export your data, deactivate, or delete your account.
        </p>
      </div>

      <ExportSection />
      <Separator />
      <DeactivateSection />
      <Separator />
      <DeleteSection userEmail={session.user.email} />
    </div>
  )
}