"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, ShieldCheck, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import {
  changePasswordAction,
  revokeSessionAction,
  revokeAllOtherSessionsAction,
} from "./action"
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "./schema"

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: standardSchemaResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const { executeAsync, isPending } = useAction(changePasswordAction)

  const handleChangePassword = async (values: ChangePasswordInput) => {
    const result = await executeAsync(values)

    if (result?.data?.failure) {
      setError("root", { message: result.data.failure })
      return
    }

    if (result?.data?.success) {
      toast.success(result.data.success)
      reset()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Lock className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Change Password</p>
            <p className="text-xs text-muted-foreground">
              Update your account password
            </p>
          </div>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Change
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleChangePassword)}
          className="space-y-4"
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.currentPassword)}>
              <FieldLabel htmlFor="currentPassword">
                Current Password
              </FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                disabled={isPending}
                {...register("currentPassword")}
              />
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field data-invalid={Boolean(errors.newPassword)}>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                {...register("newPassword")}
              />
              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
          </FieldGroup>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowNew((prev) => !prev)}
          >
            {showNew ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {showNew ? "Hide" : "Show"} new password
          </button>

          <FieldError errors={[errors.root]} />

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="size-4" />}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MfaCard() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Not enabled</p>
          </div>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Enable
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            MFA setup coming soon — supported methods: Email OTP, Authenticator
            app.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RecoveryCodesCard() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-between rounded-lg border p-4 opacity-50 pointer-events-none">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Recovery Codes</p>
              <p className="text-xs text-muted-foreground">
                Backup codes for account recovery
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            View
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>Available once MFA is enabled.</TooltipContent>
    </Tooltip>
  )
}

function RevokeSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const { executeAsync: revokeOne, isPending: revokingOne } =
    useAction(revokeSessionAction)

  const handleRevoke = async (sessionId: string) => {
    const res = await revokeOne({ sessionId })
    if (res?.data?.success) {
      toast.success("Session revoked")
      router.refresh()
    } else if (res?.data?.failure) {
      toast.error(res.data.failure)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleRevoke(sessionId)}
      disabled={revokingOne}
    >
      {revokingOne && <Spinner className="size-3" />}
      Revoke
    </Button>
  )
}

function RevokeAllSessionsButton() {
  const router = useRouter()
  const { executeAsync: revokeAll, isPending: revokingAll } = useAction(
    revokeAllOtherSessionsAction
  )

  const handleRevokeAll = async () => {
    const res = await revokeAll()
    if (res?.data?.success) {
      toast.success("All other sessions revoked")
      router.refresh()
    } else if (res?.data?.failure) {
      toast.error(res.data.failure)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleRevokeAll}
      disabled={revokingAll}
    >
      {revokingAll && <Spinner className="size-3" />}
      Revoke All Others
    </Button>
  )
}

export {
  ChangePasswordDialog,
  MfaCard,
  RecoveryCodesCard,
  RevokeAllSessionsButton,
  RevokeSessionButton,
}
