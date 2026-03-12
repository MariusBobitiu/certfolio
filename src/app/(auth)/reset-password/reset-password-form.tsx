"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useAction } from "next-safe-action/hooks"
import * as z from "zod/v4"

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

import { resetPasswordAction } from "./action"
import { resetPasswordSchema, type ResetPasswordInput } from "./schema"

type ActionValidationErrors = {
  password?: { _errors?: string[] }
  confirmPassword?: { _errors?: string[] }
}

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ResetPasswordInput & { token: string }>({
    resolver: standardSchemaResolver(
      resetPasswordSchema.extend({ token: z.string() })
    ),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  })

  const { execute, isPending, result } = useAction(resetPasswordAction)

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

  const onSubmit = (values: ResetPasswordInput & { token: string }) => {
    clearErrors("root")
    execute(values)
  }

  if (result.data?.success) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
          Your password has been updated successfully.
        </p>

        <Button asChild className="w-full">
          <Link href="/sign-in">Sign in</Link>
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
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
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
