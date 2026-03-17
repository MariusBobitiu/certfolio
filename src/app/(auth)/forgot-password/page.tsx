import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Key } from "lucide-react"

import { SESSION_COOKIE_NAME, validateSessionToken } from "@/lib/auth/session-core"

import { ForgotPasswordForm } from "./forgot-password-form"

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (sessionCookie?.value) {
    const session = await validateSessionToken(sessionCookie.value)

    if (session) {
      return redirect("/dashboard")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Key className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
