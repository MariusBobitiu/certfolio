"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
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

import { signInAction } from "./action"
import { signInSchema, type SignInInput, type SignInOutput } from "./schema"
import { Checkbox } from "@/components/ui/checkbox"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

type ActionValidationErrors = {
  email?: { _errors?: string[] }
  password?: { _errors?: string[] }
  rememberMe?: { _errors?: string[] }
}

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<z.input<typeof signInSchema>, unknown, SignInOutput>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const { execute, isPending, result } = useAction(signInAction)

  useEffect(() => {
    const validationErrors = result.validationErrors as
      | ActionValidationErrors
      | undefined

    const emailError = validationErrors?.email?._errors?.[0]
    const passwordError = validationErrors?.password?._errors?.[0]

    if (emailError) {
      setError("email", { message: emailError })
    }

    if (passwordError) {
      setError("password", { message: passwordError })
    }

    if (result.data?.failure) {
      setError("root", { message: result.data.failure })
    }

    if (result.serverError) {
      setError("root", {
        message: "We could not sign you in right now. Please try again.",
      })
    }
  }, [result, setError])

  const onSubmit = (values: SignInInput) => {
    clearErrors("root")
    execute(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
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
              disabled={isPending}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="mr-2">
                <Lock className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
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

        <div className="flex w-full items-center justify-between gap-3">
          <Field
            data-invalid={Boolean(errors.rememberMe)}
            orientation="horizontal"
            className="max-w-fit items-center gap-2"
          >
            <Checkbox
              id="rememberMe"
              disabled={isPending}
              {...register("rememberMe")}
            />
            <FieldLabel htmlFor="rememberMe" className="mt-0.5">
              Keep me signed in
            </FieldLabel>
            <FieldError errors={[errors.rememberMe]} />
          </Field>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            tabIndex={2}
          >
            Forgot password?
          </Link>
        </div>
      </FieldGroup>

      <FieldError errors={[errors.root]} />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Do not have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          tabIndex={2}
        >
          Create one
        </Link>
      </p>
    </form>
  )
}
