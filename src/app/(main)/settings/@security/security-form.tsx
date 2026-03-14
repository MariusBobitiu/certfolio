"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import QRCode from "qrcode"
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { formatDate, parseUserAgent } from "@/lib/utils"

import {
  beginTotpEnrollmentAction,
  changePasswordAction,
  confirmTotpEnrollmentAction,
  disableEmailMfaAction,
  disableTotpMfaAction,
  enableEmailMfaAction,
  regenerateRecoveryCodesAction,
  revokeTrustedDeviceAction,
  revokeSessionAction,
  revokeAllOtherSessionsAction,
} from "./action"
import {
  changePasswordSchema,
  totpCodeSchema,
  type ChangePasswordInput,
  type TotpCodeInput,
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
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
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

function MfaCard({
  email,
  emailEnabled,
  totpEnabled,
}: {
  email: string
  emailEnabled: boolean
  totpEnabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"email" | "totp">("email")
  const [totpSetup, setTotpSetup] = useState<{
    secret: string
    otpauthUrl: string
    issuer: string
    accountName: string
  } | null>(null)
  const [totpQrDataUrl, setTotpQrDataUrl] = useState<string | null>(null)
  const [totpStep, setTotpStep] = useState<"scan" | "verify" | "recovery">(
    "scan"
  )
  const [totpSecretCopied, setTotpSecretCopied] = useState(false)
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([])
  const [recoveryCodesCopied, setRecoveryCodesCopied] = useState(false)
  const [mfaPassword, setMfaPassword] = useState("")
  const [mfaPasswordRequired, setMfaPasswordRequired] = useState(false)
  const [mfaPasswordError, setMfaPasswordError] = useState<string | null>(null)
  const router = useRouter()
  const enableEmailMfa = useAction(enableEmailMfaAction)
  const disableEmailMfa = useAction(disableEmailMfaAction)
  const beginTotpEnrollment = useAction(beginTotpEnrollmentAction)
  const confirmTotpEnrollment = useAction(confirmTotpEnrollmentAction)
  const disableTotpMfa = useAction(disableTotpMfaAction)
  const {
    register: registerTotpCode,
    handleSubmit: handleTotpSubmit,
    setError: setTotpError,
    clearErrors: clearTotpErrors,
    reset: resetTotpForm,
    formState: { errors: totpErrors },
  } = useForm<TotpCodeInput>({
    resolver: standardSchemaResolver(totpCodeSchema),
    defaultValues: { code: "" },
  })

  const mfaEnabled = emailEnabled || totpEnabled

  const getSensitivePayload = () =>
    mfaPassword.trim() ? { password: mfaPassword.trim() } : { password: undefined }

  const handleSensitiveFailure = (res: {
    data?: {
      failure?: string
      requiresPasswordConfirmation?: boolean
    }
  }) => {
    if (res.data?.requiresPasswordConfirmation) {
      setMfaPasswordRequired(true)
      setMfaPasswordError(res.data.failure ?? "Confirm your password to continue.")
      return true
    }

    if (res.data?.failure) {
      setMfaPasswordError(null)
      toast.error(res.data.failure)
      return true
    }

    return false
  }

  const clearSensitivePasswordPrompt = () => {
    setMfaPasswordRequired(false)
    setMfaPasswordError(null)
    setMfaPassword("")
  }

  useEffect(() => {
    let active = true

    async function generateQrCode() {
      if (!totpSetup?.otpauthUrl) {
        setTotpQrDataUrl(null)
        return
      }

      try {
        const dataUrl = await QRCode.toDataURL(totpSetup.otpauthUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 224,
          color: {
            dark: "#0a0a0b",
            light: "#ffffff",
          },
        })

        if (active) {
          setTotpQrDataUrl(dataUrl)
        }
      } catch {
        if (active) {
          setTotpQrDataUrl(null)
        }
      }
    }

    generateQrCode()

    return () => {
      active = false
    }
  }, [totpSetup])

  const handleEnableEmail = async () => {
    const res = await enableEmailMfa.executeAsync(getSensitivePayload())

    if (handleSensitiveFailure(res ?? {})) {
      return
    }

    if (res?.data?.success) {
      toast.success(res.data.success)
      clearSensitivePasswordPrompt()
      setOpen(false)
      router.refresh()
      return
    }

    toast.error(res?.data?.failure ?? "Unable to enable email MFA")
  }

  const handleDisableEmail = async () => {
    const res = await disableEmailMfa.executeAsync(getSensitivePayload())

    if (handleSensitiveFailure(res ?? {})) {
      return
    }

    if (res?.data?.success) {
      toast.success(res.data.success)
      clearSensitivePasswordPrompt()
      setOpen(false)
      router.refresh()
      return
    }

    toast.error(res?.data?.failure ?? "Unable to disable email MFA")
  }

  const handleBeginTotpEnrollment = async () => {
    const res = await beginTotpEnrollment.executeAsync(getSensitivePayload())

    if (handleSensitiveFailure(res ?? {})) {
      return
    }

    if (
      res?.data &&
      "secret" in res.data &&
      "otpauthUrl" in res.data &&
      res.data.secret &&
      res.data.otpauthUrl
    ) {
      setTotpSetup({
        secret: res.data.secret,
        otpauthUrl: res.data.otpauthUrl,
        issuer: res.data.issuer,
        accountName: res.data.accountName,
      })
      clearSensitivePasswordPrompt()
      setTotpStep("scan")
      resetTotpForm()
      clearTotpErrors()
      toast.success(res.data.success ?? "Authenticator app setup started")
      return
    }

    toast.error("Unable to start authenticator app setup")
  }

  const handleConfirmTotpEnrollment = async (values: TotpCodeInput) => {
    clearTotpErrors()
    setMfaPasswordError(null)

    const res = await confirmTotpEnrollment.executeAsync({
      ...values,
      ...getSensitivePayload(),
    })

    if (res?.data && "requiresPasswordConfirmation" in res.data) {
      setMfaPasswordRequired(true)
      setMfaPasswordError(res.data.failure ?? "Confirm your password to continue.")
      return
    }

    if (res?.data?.failure) {
      setTotpError("root", { message: res.data.failure })
      return
    }

    if (res?.data?.success) {
      toast.success(res.data.success)
      clearSensitivePasswordPrompt()
      setNewRecoveryCodes(res.data.recoveryCodes ?? [])
      setTotpStep("recovery")
      resetTotpForm()
      return
    }

    setTotpError("root", { message: "Unable to verify authenticator code" })
  }

  const handleDisableTotp = async () => {
    const res = await disableTotpMfa.executeAsync(getSensitivePayload())

    if (handleSensitiveFailure(res ?? {})) {
      return
    }

    if (res?.data?.success) {
      toast.success(res.data.success)
      clearSensitivePasswordPrompt()
      setTotpSetup(null)
      setTotpQrDataUrl(null)
      setTotpStep("scan")
      resetTotpForm()
      setOpen(false)
      router.refresh()
      return
    }

    toast.error(res?.data?.failure ?? "Unable to disable authenticator MFA")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      return
    }

    setTotpSetup(null)
    setTotpQrDataUrl(null)
    setTotpStep("scan")
    setTotpSecretCopied(false)
    setNewRecoveryCodes([])
    setRecoveryCodesCopied(false)
    clearSensitivePasswordPrompt()
    resetTotpForm()
    clearTotpErrors()
  }

  const handleCopyTotpSecret = async () => {
    if (!totpSetup?.secret) {
      return
    }

    try {
      await navigator.clipboard.writeText(totpSetup.secret)
      setTotpSecretCopied(true)
    } catch {
      toast.error("Unable to copy setup key")
    }
  }

  useEffect(() => {
    if (!totpSecretCopied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setTotpSecretCopied(false)
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [totpSecretCopied])

  useEffect(() => {
    if (!recoveryCodesCopied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setRecoveryCodesCopied(false)
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [recoveryCodesCopied])

  const handleCopyRecoveryCodes = async () => {
    if (newRecoveryCodes.length === 0) {
      return
    }

    try {
      await navigator.clipboard.writeText(newRecoveryCodes.join("\n"))
      setRecoveryCodesCopied(true)
    } catch {
      toast.error("Unable to copy recovery codes")
    }
  }

  const handleDownloadRecoveryCodes = () => {
    if (newRecoveryCodes.length === 0) {
      return
    }

    const content = [
      "Certfolio recovery codes",
      "",
      "Store these codes somewhere safe. Each code can be used once.",
      "",
      ...newRecoveryCodes,
      "",
      `Generated: ${new Date().toISOString()}`,
    ].join("\n")
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "certfolio-recovery-codes.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFinishRecoveryCodes = () => {
    setTotpSetup(null)
    setTotpQrDataUrl(null)
    setTotpStep("scan")
    setTotpSecretCopied(false)
    setNewRecoveryCodes([])
    setRecoveryCodesCopied(false)
    resetTotpForm()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">
              {mfaEnabled ? "Enabled" : "Not enabled"}
            </p>
          </div>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {mfaEnabled ? "Manage" : "Enable"}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Add a second step to sign-in with either email or an authenticator
            app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="inline-flex rounded-lg border bg-muted/30 p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                activeTab === "email"
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("email")}
            >
              Email code
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                activeTab === "totp"
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("totp")}
            >
              Authenticator app
            </button>
          </div>

          {activeTab === "email" ? (
            <div className="space-y-4 rounded-xl border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email OTP</p>
                <p className="text-sm text-muted-foreground">
                  Send a 6-digit code to {email} when you sign in with your
                  password.
                </p>
              </div>

              <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                {emailEnabled
                  ? "Email MFA is active for this account."
                  : "Enable this if you want email to be your second factor while TOTP is still being built."}
              </div>

              {mfaPasswordRequired ? (
                <div className="space-y-2 rounded-lg border p-3">
                  <Field>
                    <FieldLabel htmlFor="mfaPasswordEmail">
                      Confirm your password
                    </FieldLabel>
                    <Input
                      id="mfaPasswordEmail"
                      type="password"
                      autoComplete="current-password"
                      value={mfaPassword}
                      onChange={(event) => setMfaPassword(event.target.value)}
                    />
                  </Field>
                  {mfaPasswordError ? (
                    <p className="text-sm text-destructive">{mfaPasswordError}</p>
                  ) : null}
                </div>
              ) : null}

              <DialogFooter className="sm:justify-start">
                {emailEnabled ? (
                  <Button
                    variant="destructive"
                    onClick={handleDisableEmail}
                    disabled={disableEmailMfa.isPending}
                  >
                    {disableEmailMfa.isPending && (
                      <Spinner className="size-4" />
                    )}
                    Disable email MFA
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnableEmail}
                    disabled={enableEmailMfa.isPending}
                  >
                    {enableEmailMfa.isPending && <Spinner className="size-4" />}
                    Enable email MFA
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Authenticator app</p>
                <p className="text-sm text-muted-foreground">
                  Use any TOTP app to generate 6-digit codes for sign-in.
                </p>
              </div>

              {totpEnabled ? (
                <>
                  <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                    Authenticator app MFA is active for this account.
                  </div>

                  {mfaPasswordRequired ? (
                    <div className="space-y-2 rounded-lg border p-3">
                      <Field>
                        <FieldLabel htmlFor="mfaPasswordTotpDisable">
                          Confirm your password
                        </FieldLabel>
                        <Input
                          id="mfaPasswordTotpDisable"
                          type="password"
                          autoComplete="current-password"
                          value={mfaPassword}
                          onChange={(event) => setMfaPassword(event.target.value)}
                        />
                      </Field>
                      {mfaPasswordError ? (
                        <p className="text-sm text-destructive">
                          {mfaPasswordError}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <DialogFooter className="sm:justify-start">
                    <Button
                      variant="destructive"
                      onClick={handleDisableTotp}
                      disabled={disableTotpMfa.isPending}
                    >
                      {disableTotpMfa.isPending && (
                        <Spinner className="size-4" />
                      )}
                      Disable authenticator MFA
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  {totpStep === "recovery" ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                        Save these recovery codes somewhere safe. Each code can
                        be used once if you lose access to your authenticator
                        app.
                      </div>

                      <div className="rounded-lg bg-muted/20 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">Recovery codes</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="Download recovery codes"
                              className="shrink-0 text-muted-foreground transition hover:text-foreground"
                              onClick={handleDownloadRecoveryCodes}
                            >
                              <Download className="size-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Copy recovery codes"
                              className="shrink-0 text-muted-foreground transition hover:text-foreground"
                              onClick={handleCopyRecoveryCodes}
                            >
                              {recoveryCodesCopied ? (
                                <CheckCircle2 className="size-4 text-emerald-400" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {newRecoveryCodes.map((code) => (
                            <div
                              key={code}
                              className="rounded-md bg-background px-3 py-2 font-mono text-sm"
                            >
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>

                      <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleFinishRecoveryCodes}>
                          Done
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : totpSetup ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                        {totpStep === "scan"
                          ? "Scan the QR code with your authenticator app, or use the setup key if scanning is unavailable."
                          : "Enter the current 6-digit code from your authenticator app to finish setup."}
                      </div>

                      {totpStep === "scan" ? (
                        <div className="space-y-4">
                          <div className="mx-auto w-full max-w-52 rounded-2xl bg-white p-3 shadow-sm">
                            <div className="flex aspect-square items-center justify-center rounded-xl bg-white">
                              {totpQrDataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={totpQrDataUrl}
                                  alt="TOTP enrollment QR code"
                                  className="h-full w-full rounded-lg object-contain"
                                />
                              ) : (
                                <div className="px-4 text-center text-xs text-slate-500">
                                  Generating QR code...
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-muted/20 p-4">
                            <p className="text-xs text-muted-foreground">
                              Can&apos;t scan? Use this setup key instead.
                            </p>
                            <div className="mt-2 flex items-start justify-between gap-3">
                              <p className="font-mono text-sm break-all text-foreground">
                                {totpSetup.secret}
                              </p>
                              <button
                                type="button"
                                aria-label="Copy setup key"
                                className="shrink-0 text-muted-foreground transition hover:text-foreground"
                                onClick={handleCopyTotpSecret}
                              >
                                {totpSecretCopied ? (
                                  <CheckCircle2 className="size-4 text-emerald-400" />
                                ) : (
                                  <Copy className="size-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-start">
                            <Button
                              type="button"
                              onClick={() => setTotpStep("verify")}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleTotpSubmit(
                            handleConfirmTotpEnrollment
                          )}
                          className="space-y-4"
                        >
                          {mfaPasswordRequired ? (
                            <div className="space-y-2 rounded-lg border p-3">
                              <Field>
                                <FieldLabel htmlFor="mfaPasswordTotpVerify">
                                  Confirm your password
                                </FieldLabel>
                                <Input
                                  id="mfaPasswordTotpVerify"
                                  type="password"
                                  autoComplete="current-password"
                                  value={mfaPassword}
                                  onChange={(event) =>
                                    setMfaPassword(event.target.value)
                                  }
                                />
                              </Field>
                              {mfaPasswordError ? (
                                <p className="text-sm text-destructive">
                                  {mfaPasswordError}
                                </p>
                              ) : null}
                            </div>
                          ) : null}

                          <FieldGroup>
                            <Field data-invalid={Boolean(totpErrors.code)}>
                              <FieldLabel htmlFor="totpCode">
                                Authenticator code
                              </FieldLabel>
                              <Input
                                id="totpCode"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="123456"
                                disabled={confirmTotpEnrollment.isPending}
                                {...registerTotpCode("code")}
                              />
                              <FieldError errors={[totpErrors.code]} />
                            </Field>
                          </FieldGroup>

                          <FieldError errors={[totpErrors.root]} />

                          <div className="flex flex-wrap gap-3">
                            <Button
                              type="submit"
                              disabled={confirmTotpEnrollment.isPending}
                            >
                              {confirmTotpEnrollment.isPending && (
                                <Spinner className="size-4" />
                              )}
                              Verify and enable
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setTotpStep("scan")}
                            >
                              Back
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                        Set up an authenticator app to generate a 6-digit code
                        when you sign in.
                      </div>

                      {mfaPasswordRequired ? (
                        <div className="space-y-2 rounded-lg border p-3">
                          <Field>
                            <FieldLabel htmlFor="mfaPasswordTotpSetup">
                              Confirm your password
                            </FieldLabel>
                            <Input
                              id="mfaPasswordTotpSetup"
                              type="password"
                              autoComplete="current-password"
                              value={mfaPassword}
                              onChange={(event) =>
                                setMfaPassword(event.target.value)
                              }
                            />
                          </Field>
                          {mfaPasswordError ? (
                            <p className="text-sm text-destructive">
                              {mfaPasswordError}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <DialogFooter className="sm:justify-start">
                        <Button
                          onClick={handleBeginTotpEnrollment}
                          disabled={beginTotpEnrollment.isPending}
                        >
                          {beginTotpEnrollment.isPending && (
                            <Spinner className="size-4" />
                          )}
                          Set up authenticator app
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RecoveryCodesCard({
  enabled,
  remaining,
  totpEnabled,
}: {
  enabled: boolean
  remaining: number
  totpEnabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [newCodes, setNewCodes] = useState<string[]>([])
  const [codesCopied, setCodesCopied] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [regenerationConfirmed, setRegenerationConfirmed] = useState(false)
  const regenerateRecoveryCodes = useAction(regenerateRecoveryCodesAction)
  const router = useRouter()

  useEffect(() => {
    if (!codesCopied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCodesCopied(false)
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [codesCopied])

  const handleGenerateCodes = async () => {
    const res = await regenerateRecoveryCodes.executeAsync({
      password: password.trim() || undefined,
    })

    if (res?.data && "requiresPasswordConfirmation" in res.data) {
      setPasswordRequired(true)
      setPasswordError(res.data.failure ?? "Confirm your password to continue.")
      return
    }

    if (res?.data?.failure) {
      setPasswordError(null)
      toast.error(res.data.failure)
      return
    }

    if (res?.data && "recoveryCodes" in res.data) {
      setPasswordRequired(false)
      setPasswordError(null)
      setPassword("")
      setRegenerationConfirmed(false)
      setNewCodes(res.data.recoveryCodes ?? [])
      toast.success(res.data.success ?? "Recovery codes generated")
      router.refresh()
    }
  }

  const handleCopyCodes = async () => {
    if (newCodes.length === 0) {
      return
    }

    try {
      await navigator.clipboard.writeText(newCodes.join("\n"))
      setCodesCopied(true)
    } catch {
      toast.error("Unable to copy recovery codes")
    }
  }

  const handleDownloadCodes = () => {
    if (newCodes.length === 0) {
      return
    }

    const content = [
      "Certfolio recovery codes",
      "",
      "Store these codes somewhere safe. Each code can be used once.",
      "",
      ...newCodes,
      "",
      `Generated: ${new Date().toISOString()}`,
    ].join("\n")
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "certfolio-recovery-codes.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setNewCodes([])
      setCodesCopied(false)
      setPassword("")
      setPasswordRequired(false)
      setPasswordError(null)
      setRegenerationConfirmed(false)
    }
  }

  const handleDone = () => {
    setNewCodes([])
    setCodesCopied(false)
    setPassword("")
    setPasswordRequired(false)
    setPasswordError(null)
    setRegenerationConfirmed(false)
    setOpen(false)
  }

  if (!totpEnabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="pointer-events-none flex items-center justify-between rounded-lg border p-4 opacity-50">
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
        <TooltipContent>Available once authenticator MFA is enabled.</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <KeyRound className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Recovery Codes</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? `${remaining} code${remaining === 1 ? "" : "s"} remaining`
                : "No recovery codes generated yet"}
            </p>
          </div>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {enabled ? "Manage" : "Generate"}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Recovery Codes</DialogTitle>
          <DialogDescription>
            Use a recovery code to sign in if you lose access to your
            authenticator app. Each code works once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
            {newCodes.length > 0
              ? "These are your new recovery codes. Save them somewhere safe before closing this dialog."
              : enabled
                ? `${remaining} recovery code${remaining === 1 ? "" : "s"} remaining. Generating a new set invalidates all previous codes.`
                : "Generate a set of backup codes and store them somewhere safe."}
          </div>

          {enabled && newCodes.length === 0 ? (
            <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={regenerationConfirmed}
                onCheckedChange={(checked) =>
                  setRegenerationConfirmed(checked === true)
                }
              />
              <span className="text-muted-foreground">
                I understand that generating a new set will permanently
                invalidate all previously saved recovery codes.
              </span>
            </label>
          ) : null}

          {passwordRequired && newCodes.length === 0 ? (
            <div className="space-y-2 rounded-lg border p-3">
              <Field>
                <FieldLabel htmlFor="recoveryCodesPassword">
                  Confirm your password
                </FieldLabel>
                <Input
                  id="recoveryCodesPassword"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              {passwordError ? (
                <p className="text-sm text-destructive">{passwordError}</p>
              ) : null}
            </div>
          ) : null}

          {newCodes.length > 0 ? (
            <div className="rounded-lg bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">New recovery codes</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Download recovery codes"
                    className="shrink-0 text-muted-foreground transition hover:text-foreground"
                    onClick={handleDownloadCodes}
                  >
                    <Download className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Copy recovery codes"
                    className="shrink-0 text-muted-foreground transition hover:text-foreground"
                    onClick={handleCopyCodes}
                  >
                    {codesCopied ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {newCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-md bg-background px-3 py-2 font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <DialogFooter className="sm:justify-start">
            {newCodes.length > 0 ? (
              <Button type="button" onClick={handleDone}>
                Done
              </Button>
            ) : (
              <Button
                onClick={handleGenerateCodes}
                disabled={
                  regenerateRecoveryCodes.isPending ||
                  (enabled && !regenerationConfirmed)
                }
              >
                {regenerateRecoveryCodes.isPending && (
                  <Spinner className="size-4" />
                )}
                {enabled
                  ? "Regenerate recovery codes"
                  : "Generate recovery codes"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
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

function TrustedDevicesCard({
  trustedDevices,
}: {
  trustedDevices: Array<{
    id: string
    user_agent: string | null
    last_used_at: Date | null
    expires_at: Date
  }>
}) {
  const router = useRouter()
  const { executeAsync, isPending } = useAction(revokeTrustedDeviceAction)

  const handleRevoke = async (deviceId: string) => {
    const res = await executeAsync({ deviceId })

    if (res?.data?.success) {
      toast.success(res.data.success)
      router.refresh()
      return
    }

    if (res?.data?.failure) {
      toast.error(res.data.failure)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Remembered Devices</p>
          <p className="text-xs text-muted-foreground">
            Browsers that can skip MFA on this account
          </p>
        </div>
      </div>

      {trustedDevices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No remembered devices.
        </p>
      ) : (
        <div className="space-y-2">
          {trustedDevices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {parseUserAgent(device.user_agent)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {device.last_used_at
                    ? `Last used ${formatDate(device.last_used_at)}`
                    : `Added ${formatDate(device.expires_at)}`}{" "}
                  &middot; Expires {formatDate(device.expires_at)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRevoke(device.id)}
                disabled={isPending}
              >
                {isPending && <Spinner className="size-3" />}
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export {
  ChangePasswordDialog,
  MfaCard,
  RecoveryCodesCard,
  RevokeAllSessionsButton,
  RevokeSessionButton,
  TrustedDevicesCard,
}
