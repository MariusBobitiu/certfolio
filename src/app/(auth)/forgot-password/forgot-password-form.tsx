"use client"

import Link from "next/link"
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
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { forgotPasswordAction } from "./action"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
  type ForgotPasswordOutput,
} from "./schema"

export function ForgotPasswordForm() {
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

  const { execute, isPending, result } = useAction(forgotPasswordAction)

  const message = result.data?.success ?? result.data?.failure

  const onSubmit = (values: ForgotPasswordInput) => {
    clearErrors()
    execute(values)
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
              disabled={isPending}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>

      {message ? (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Sending..." : "Send reset link"}
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
