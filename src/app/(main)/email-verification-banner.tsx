"use client"

import Link from "next/link"
import { Loader2, MailWarning } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"

import { resendVerificationEmailAction } from "./verification-actions"

export function EmailVerificationBanner() {
  const { execute, isPending, result } = useAction(resendVerificationEmailAction)

  const message =
    result.data?.success ??
    result.data?.failure ??
    (result.serverError
      ? "We could not resend the email right now. Please try again."
      : null)

  return (
    <section className="mx-auto max-w-7xl rounded-xl border border-amber-300/60 bg-amber-100/70 p-4 text-amber-950 shadow-sm backdrop-blur dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MailWarning className="size-4" />
            Verify your email address
          </p>
          <p className="text-sm text-amber-900/90 dark:text-amber-200/90">
            Your account is active, but please verify your email to secure your account and receive important updates.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-400/60 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/50 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
            onClick={() => {
              execute()
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Sending..." : "Resend email"}
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-amber-900 hover:bg-amber-100/60 hover:text-amber-950 dark:text-amber-100 dark:hover:bg-amber-900/50">
            <Link href="/verify-email">Open verify page</Link>
          </Button>
        </div>
      </div>

      {message ? (
        <p className="mt-3 text-xs text-amber-900/90 dark:text-amber-200/90">{message}</p>
      ) : null}
    </section>
  )
}
