"use client"

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { AlertTriangle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import {
  exportProfileAction,
  exportCredentialsAction,
  deactivateAccountAction,
  deleteAccountAction,
} from "./action"

function downloadFile(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportSection() {
  const {
    execute: exportProfile,
    isPending: profilePending,
    result: profileResult,
  } = useAction(exportProfileAction)
  const {
    execute: exportCredentials,
    isPending: credentialsPending,
    result: credentialsResult,
  } = useAction(exportCredentialsAction)

  useEffect(() => {
    if (profileResult.data?.data) {
      downloadFile(profileResult.data.data, profileResult.data.filename)
      toast.success("Profile data exported")
    }
    if (profileResult.data?.failure) {
      toast.error(profileResult.data.failure)
    }
  }, [profileResult])

  useEffect(() => {
    if (credentialsResult.data?.data !== undefined) {
      downloadFile(credentialsResult.data.data, credentialsResult.data.filename)
      toast.success("Credentials exported")
    }
    if (credentialsResult.data?.failure) {
      toast.error(credentialsResult.data.failure)
    }
  }, [credentialsResult])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Export Data</h3>
        <p className="text-sm text-muted-foreground">
          Download a copy of your profile data or credentials.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => exportProfile({ format: "json" })}
          disabled={profilePending}
        >
          {profilePending ? (
            <Spinner className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
          Export Profile (JSON)
        </Button>
        <Button
          variant="outline"
          onClick={() => exportProfile({ format: "csv" })}
          disabled={profilePending}
        >
          {profilePending ? (
            <Spinner className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
          Export Profile (CSV)
        </Button>
        <Button
          variant="outline"
          onClick={() => exportCredentials({ format: "json" })}
          disabled={credentialsPending}
        >
          {credentialsPending ? (
            <Spinner className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
          Export Credentials (JSON)
        </Button>
      </div>
    </div>
  )
}

export function DeactivateSection() {
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const { executeAsync, isPending } = useAction(deactivateAccountAction)

  const handleDeactivate = async () => {
    const res = await executeAsync({
      password: password.trim() || undefined,
    })

    if (res?.data && "requiresPasswordConfirmation" in res.data) {
      setPasswordRequired(true)
      setPasswordError(res.data.failure ?? "Confirm your password to continue.")
      return
    }

    if (res?.data?.failure) {
      toast.error(res.data.failure)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-amber-600 dark:text-amber-400">
          Deactivate Account
        </h3>
        <p className="text-sm text-muted-foreground">
          Temporarily disable your account. You can reactivate it later by
          contacting support.
        </p>
      </div>
      {!confirming ? (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          <AlertTriangle className="size-4" />
          Deactivate Account
        </Button>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <p className="text-sm font-medium">
            Are you sure you want to deactivate your account?
          </p>
          <p className="text-xs text-muted-foreground">
            Your profile and credentials will be hidden. You will be signed out
            immediately.
          </p>
          {passwordRequired ? (
            <div className="max-w-sm">
              <Label htmlFor="deactivate-password">Confirm password</Label>
              <Input
                id="deactivate-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError ? (
                <p className="mt-2 text-sm text-destructive">{passwordError}</p>
              ) : null}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isPending}
            >
              {isPending && <Spinner className="size-4" />}
              Confirm Deactivation
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfirming(false)
                setPassword("")
                setPasswordRequired(false)
                setPasswordError(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DeleteSection({ userEmail }: { userEmail: string }) {
  const [confirming, setConfirming] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const { executeAsync, isPending, result } = useAction(deleteAccountAction)

  useEffect(() => {
    if (result.data && "requiresPasswordConfirmation" in result.data) {
      setPasswordRequired(true)
      setPasswordError(result.data.failure ?? "Confirm your password to continue.")
      return
    }

    if (result.data?.failure) {
      toast.error(result.data.failure)
    }
  }, [result])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-destructive">Delete Account</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account. This action cannot be undone.
        </p>
      </div>
      {!confirming ? (
        <Button variant="destructive" onClick={() => setConfirming(true)}>
          <AlertTriangle className="size-4" />
          Delete Account
        </Button>
      ) : (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm font-medium">
            This action is irreversible. Type your email to confirm.
          </p>
          <div className="max-w-sm">
            <Label htmlFor="confirm-email">Confirm email address</Label>
            <Input
              id="confirm-email"
              type="email"
              placeholder={userEmail}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          {passwordRequired ? (
            <div className="max-w-sm">
              <Label htmlFor="delete-password">Confirm password</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError ? (
                <p className="mt-2 text-sm text-destructive">{passwordError}</p>
              ) : null}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() =>
                executeAsync({
                  confirmEmail,
                  password: password.trim() || undefined,
                })
              }
              disabled={isPending || confirmEmail !== userEmail}
            >
              {isPending && <Spinner className="size-4" />}
              Permanently Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfirming(false)
                setConfirmEmail("")
                setPassword("")
                setPasswordRequired(false)
                setPasswordError(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
