"use client"

import { useEffect, useMemo, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Mail, Shield } from "lucide-react"
import * as z from "zod/v4"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { resendMfaCodeAction, verifyMfaCodeAction } from "./action"
import {
  verifyMfaCodeSchema,
  type VerifyMfaCodeInput,
  type VerifyMfaCodeOutput,
} from "./schema"

type MfaFormProps = {
  method: "email" | "totp"
  maskedEmail?: string
  resendAvailableAt: string
}

type ActionValidationErrors = {
  code?: { _errors?: string[] }
}

export function MfaForm({
  method,
  maskedEmail,
  resendAvailableAt,
}: MfaFormProps) {
  const [cooldownLabel, setCooldownLabel] = useState("")
  const [totpMode, setTotpMode] = useState<"totp" | "recovery">("totp")

  const resendAt = useMemo(() => {
    return new Date(resendAvailableAt)
  }, [resendAvailableAt])

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<
    z.input<typeof verifyMfaCodeSchema>,
    unknown,
    VerifyMfaCodeOutput
  >({
    resolver: standardSchemaResolver(verifyMfaCodeSchema),
    defaultValues: { code: "", codeType: "totp" },
  })

  const verifyAction = useAction(verifyMfaCodeAction)
  const resendAction = useAction(resendMfaCodeAction)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remainingMs = resendAt.getTime() - Date.now()

      if (remainingMs <= 0) {
        setCooldownLabel("")
        window.clearInterval(timer)
        return
      }

      const totalSeconds = Math.ceil(remainingMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      setCooldownLabel(
        minutes > 0
          ? `${minutes}:${seconds.toString().padStart(2, "0")}`
          : `0:${seconds.toString().padStart(2, "0")}`
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendAt])

  useEffect(() => {
    const validationErrors = verifyAction.result.validationErrors as
      | ActionValidationErrors
      | undefined

    const codeError = validationErrors?.code?._errors?.[0]

    if (codeError) {
      setError("code", { message: codeError })
    }

    if (verifyAction.result.data?.failure) {
      setError("root", { message: verifyAction.result.data.failure })
    }

    if (verifyAction.result.serverError) {
      setError("root", {
        message: "We could not verify your code right now. Please try again.",
      })
    }
  }, [setError, verifyAction.result])

  useEffect(() => {
    if (resendAction.result.data?.failure) {
      setError("root", { message: resendAction.result.data.failure })
    }
  }, [resendAction.result, setError])

  const handleVerify = (values: VerifyMfaCodeInput) => {
    clearErrors("root")
    verifyAction.execute({
      ...values,
      codeType: method === "totp" ? totpMode : "totp",
    })
  }

  const handleResend = () => {
    clearErrors("root")
    resendAction.execute()
  }

  return (
    <div className="space-y-6">
      {method === "email" ? (
        <div className="space-y-6">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit verification code to {maskedEmail}.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleVerify)} className="space-y-4">
            <FieldGroup>
              <Field data-invalid={Boolean(errors.code)}>
                <FieldLabel htmlFor="code">Verification code</FieldLabel>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  disabled={verifyAction.isPending}
                  {...register("code")}
                />
                <FieldError errors={[errors.code]} />
              </Field>
            </FieldGroup>

            <FieldError errors={[errors.root]} />

            <Button
              type="submit"
              className="w-full"
              disabled={verifyAction.isPending}
            >
              {verifyAction.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {verifyAction.isPending ? "Verifying..." : "Verify and continue"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={Boolean(cooldownLabel) || resendAction.isPending}
              onClick={handleResend}
            >
              {resendAction.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {resendAction.isPending
                ? "Sending..."
                : cooldownLabel
                  ? `Resend available in ${cooldownLabel}`
                  : "Resend code"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border bg-muted/20 p-5">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {totpMode === "totp"
                    ? "Open your authenticator app"
                    : "Use a recovery code"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totpMode === "totp"
                    ? "Enter the current 6-digit code to finish signing in."
                    : "Enter one of your saved recovery codes to finish signing in."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleVerify)} className="space-y-4">
            <FieldGroup>
              <Field data-invalid={Boolean(errors.code)}>
                <FieldLabel htmlFor="code">
                  {totpMode === "totp" ? "Authenticator code" : "Recovery code"}
                </FieldLabel>
                <Input
                  id="code"
                  inputMode={totpMode === "totp" ? "numeric" : "text"}
                  autoComplete="one-time-code"
                  maxLength={totpMode === "totp" ? 6 : 16}
                  placeholder={
                    totpMode === "totp" ? "123456" : "ABCD-EFGH"
                  }
                  disabled={verifyAction.isPending}
                  {...register("code")}
                />
                <FieldError errors={[errors.code]} />
              </Field>
            </FieldGroup>

            <FieldError errors={[errors.root]} />

            <Button
              type="submit"
              className="w-full"
              disabled={verifyAction.isPending}
            >
              {verifyAction.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {verifyAction.isPending ? "Verifying..." : "Verify and continue"}
            </Button>

            {totpMode === "totp" ? (
              <button
                type="button"
                className="w-full text-sm text-muted-foreground transition hover:text-foreground"
                onClick={() => {
                  clearErrors()
                  setTotpMode("recovery")
                }}
              >
                Can&apos;t access your authenticator app? Use a recovery code
              </button>
            ) : (
              <button
                type="button"
                className="w-full text-sm text-muted-foreground transition hover:text-foreground"
                onClick={() => {
                  clearErrors()
                  setTotpMode("totp")
                }}
              >
                Back to authenticator code
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
