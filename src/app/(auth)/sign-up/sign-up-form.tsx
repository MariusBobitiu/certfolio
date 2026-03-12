"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

import { signUpAction } from "./action"
import { signUpSchema, type SignUpInput, type SignUpOutput } from "./schema"

type ActionValidationErrors = {
  name?: { _errors?: string[] }
  email?: { _errors?: string[] }
  password?: { _errors?: string[] }
  confirmPassword?: { _errors?: string[] }
  rememberMe?: { _errors?: string[] }
}

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<z.input<typeof signUpSchema>, unknown, SignUpOutput>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    },
  })

  const { execute, isPending, result } = useAction(signUpAction)

  useEffect(() => {
    const validationErrors = result.validationErrors as
      | ActionValidationErrors
      | undefined

    const nameError = validationErrors?.name?._errors?.[0]
    const emailError = validationErrors?.email?._errors?.[0]
    const passwordError = validationErrors?.password?._errors?.[0]
    const confirmPasswordError = validationErrors?.confirmPassword?._errors?.[0]

    if (nameError) {
      setError("name", { message: nameError })
    }

    if (emailError) {
      setError("email", { message: emailError })
    }

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
        message: "We could not create your account right now. Please try again.",
      })
    }
  }, [result, setError])

  const onSubmit = (values: SignUpInput) => {
    clearErrors("root")
    execute(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="mr-2">
                <User className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              disabled={isPending}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </InputGroup>
          <FieldError errors={[errors.name]} />
        </Field>

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
              placeholder="Create a password"
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

        <Field
          data-invalid={Boolean(errors.rememberMe)}
          orientation="horizontal"
          className="max-w-fit items-center gap-2"
        >
          <Checkbox id="rememberMe" disabled={isPending} {...register("rememberMe")} />
          <FieldLabel htmlFor="rememberMe" className="mt-0.5">
            Keep me signed in
          </FieldLabel>
          <FieldError errors={[errors.rememberMe]} />
        </Field>
      </FieldGroup>

      <FieldError errors={[errors.root]} />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
