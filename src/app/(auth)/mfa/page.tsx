import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"

import { getCurrentSession } from "@/lib/auth/session"
import { clearPendingMfaCookie, getPendingMfaChallenge } from "@/lib/auth/mfa"

import { MfaForm } from "./mfa-form"

export default async function MultiFactorAuthPage() {
  const currentSession = await getCurrentSession()

  if (currentSession) {
    redirect("/dashboard")
  }

  const pendingChallenge = await getPendingMfaChallenge()

  if (!pendingChallenge) {
    await clearPendingMfaCookie()
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="size-6" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify it&apos;s you
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your second step to finish signing in to Certfolio.
        </p>
      </div>

      <MfaForm
        method={pendingChallenge.method}
        maskedEmail={pendingChallenge.method === "email" ? pendingChallenge.maskedEmail : undefined}
        resendAvailableAt={pendingChallenge.resendAvailableAt.toISOString()}
      />
    </div>
  )
}
