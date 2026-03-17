import { redirect } from "next/navigation"
import { Key } from "lucide-react"

import { getPasswordResetPendingCookie } from "@/lib/auth/password-reset"

import { ResetPasswordForm } from "./reset-password-form"

export default async function ResetPasswordPage() {
  const pending = await getPasswordResetPendingCookie()

  if (!pending) {
    redirect("/forgot-password")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Key className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
