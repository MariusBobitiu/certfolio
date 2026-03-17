"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { forgotPasswordAction } from "./action"
import {
  forgotPasswordSchema,
  verifyForgotPasswordCodeSchema,
  type ForgotPasswordInput,
  type ForgotPasswordOutput,
  type VerifyForgotPasswordCodeOutput,
  type VerifyForgotPasswordCodeInput,
} from "./schema"
import { verifyForgotPasswordCodeAction } from "./action"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [emailForCode, setEmailForCode] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<ForgotPasswordInput, unknown, ForgotPasswordOutput>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const {
    control: codeControl,
    handleSubmit: handleSubmitCode,
    clearErrors: clearCodeErrors,
    formState: { errors: codeErrors },
  } = useForm<
    VerifyForgotPasswordCodeInput,
    unknown,
    VerifyForgotPasswordCodeOutput
  >({
    resolver: standardSchemaResolver(verifyForgotPasswordCodeSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  })

  const {
    execute: executeSend,
    isPending: isSending,
    result: sendResult,
  } = useAction(forgotPasswordAction, {
    onSuccess: ({ input, data }) => {
      if (data?.success) {
        setEmailForCode(input.email.trim().toLowerCase())
      }
    },
  })

  const {
    execute: executeVerify,
    isPending: isVerifying,
    result: verifyResult,
  } = useAction(verifyForgotPasswordCodeAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.redirectTo) {
        router.push("/reset-password")
      }
    },
  })

  const onSubmit = (values: ForgotPasswordInput) => {
    clearErrors()
    executeSend(values)
  }

  const onSubmitCode = (values: VerifyForgotPasswordCodeInput) => {
    if (!emailForCode) {
      return
    }

    clearCodeErrors()
    executeVerify({
      email: emailForCode,
      code: values.code,
    })
  }

  if (emailForCode) {
    return (
      <form onSubmit={handleSubmitCode(onSubmitCode)} className="space-y-6">
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
          If an account is registered using that email address, you should receive a
          code.
        </p>

        <FieldGroup>
          <Field data-invalid={Boolean(codeErrors.code)}>
            <FieldLabel htmlFor="code" className="mb-1.5">Reset code</FieldLabel>
            <Controller
              name="code"
              control={codeControl}
              render={({ field }) => (
                <InputOTP
                  id="code"
                  maxLength={8}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  disabled={isVerifying}
                  value={field.value ?? ""}
                  onBlur={field.onBlur}
                  onChange={(value) => field.onChange(value.toUpperCase())}
                  onComplete={(value) => {
                    if (!emailForCode || isVerifying) {
                      return
                    }

                    clearCodeErrors()
                    executeVerify({
                      email: emailForCode,
                      code: value,
                    })
                  }}
                  pasteTransformer={(value) =>
                    value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                  }
                  aria-invalid={Boolean(codeErrors.code)}
                  containerClassName="w-full justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="font-mono"
                    />
                    <InputOTPSlot
                      index={1}
                      className="font-mono"
                    />
                    <InputOTPSlot
                      index={2}
                      className="font-mono"
                    />
                    <InputOTPSlot
                      index={3}
                      className="font-mono"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-3 text-muted-foreground/80" />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={4}
                      className="font-mono"
                    />
                    <InputOTPSlot
                      index={5}
                      className="font-mono"
                    />
                    <InputOTPSlot
                      index={6}
                      className="font-mono"
                    />
                    <InputOTPSlot
                      index={7}
                      className="font-mono"
                    />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FieldError errors={[codeErrors.code]} />
          </Field>
        </FieldGroup>

        {verifyResult.data?.failure ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {verifyResult.data.failure}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying && <Loader2 className="size-4 animate-spin" />}
          {isVerifying ? "Verifying..." : "Verify code"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isVerifying}
          onClick={() => setEmailForCode(null)}
        >
          Use a different email
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="mr-2">
                <Mail className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="you@certfolio.app"
              autoComplete="email"
              disabled={isSending}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>

      {sendResult.data?.failure ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {sendResult.data.failure}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSending}>
        {isSending && <Loader2 className="size-4 animate-spin" />}
        {isSending ? "Sending..." : "Send reset code"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          tabIndex={2}
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
