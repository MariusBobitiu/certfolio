"use client"

import { useEffect } from "react"
import { useAction } from "next-safe-action/hooks"

import { clearPendingEmailVerificationAction } from "./action"

export function ClearPendingEmailVerification() {
  const { execute } = useAction(clearPendingEmailVerificationAction)

  useEffect(() => {
    execute()
  }, [execute])

  return null
}
