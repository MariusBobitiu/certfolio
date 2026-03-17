"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
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
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

import { finalizeResetPasswordAction, resetPasswordAction } from "./action"
import { resetPasswordSchema, type ResetPasswordInput } from "./schema"

type FormValues = ResetPasswordInput

type ActionValidationErrors = {
  password?: { _errors?: string[] }
  confirmPassword?: { _errors?: string[] }
}

export function ResetPasswordForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { execute, isPending, result } = useAction(resetPasswordAction)
  const {
    execute: executeFinalize,
    isPending: isFinalizing,
    result: finalizeResult,
  } = useAction(finalizeResetPasswordAction)

  useEffect(() => {
    if (result.data?.success) {
      const timeout = window.setTimeout(() => {
        executeFinalize({})
      }, 5000)

      return () => window.clearTimeout(timeout)
    }
  }, [executeFinalize, result.data?.success])

  useEffect(() => {
    if (finalizeResult.data?.success) {
      router.push("/sign-in")
    }
  }, [finalizeResult.data?.success, router])

  useEffect(() => {
    const validationErrors = result.validationErrors as
      | ActionValidationErrors
      | undefined

    const passwordError = validationErrors?.password?._errors?.[0]
    const confirmPasswordError = validationErrors?.confirmPassword?._errors?.[0]

    if (passwordError) {
      setError("password", { message: passwordError })
    }

    if (confirmPasswordError) {
      setError("confirmPassword", { message: confirmPasswordError })
    }

    if (result.data?.failure) {
      setError("root", { message: result.data.failure })
    }

    if (result.serverError) {
      setError("root", {
        message: "We could not reset your password right now. Please try again.",
      })
    }
  }, [result, setError])

  useEffect(() => {
    if (result.data?.success) {
      const interval = window.setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      return () => window.clearInterval(interval)
    }
  }, [result.data?.success])

  const onSubmit = (values: FormValues) => {
    clearErrors("root")
    execute(values)
  }

  if (result.data?.success) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
          Your password has been updated successfully. You will be redirected to the sign in page in {countdown} seconds.
        </p>

        <Button
          type="button"
          className="w-full"
          disabled={isFinalizing}
          onClick={() => executeFinalize({})}
        >
          {isFinalizing && <Loader2 className="size-4 animate-spin" />}
          {isFinalizing ? "Redirecting..." : "Go to sign in"}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="mr-2">
                <Lock className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a new password"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                className="ml-2"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="mr-2">
                <Lock className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                className="ml-2"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <FieldError errors={[errors.root]} />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Resetting..." : "Reset password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <button
          type="button"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={() => router.push("/sign-in")}
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
