"use client"

import { useEffect } from "react"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Mail } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
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
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

import { resendVerificationEmailAction } from "./action"

const resendVerificationFormSchema = z.object({
  email: z.email("Enter a valid email address."),
})

type ResendVerificationFormInput = z.input<typeof resendVerificationFormSchema>
type ResendVerificationFormOutput = z.output<typeof resendVerificationFormSchema>

type ActionValidationErrors = {
  email?: { _errors?: string[] }
}

export function ResendVerificationForm() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset: resetForm,
    formState: { errors },
  } = useForm<
    ResendVerificationFormInput,
    unknown,
    ResendVerificationFormOutput
  >({
    resolver: standardSchemaResolver(resendVerificationFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const { execute, isPending, result, reset } = useAction(
    resendVerificationEmailAction
  )

  useEffect(() => {
    const validationErrors = result.validationErrors as
      | ActionValidationErrors
      | undefined

    const emailError = validationErrors?.email?._errors?.[0]

    if (emailError) {
      setError("email", { message: emailError })
    }

    if (result.data?.failure) {
      setError("root", { message: result.data.failure })
    }

    if (result.data?.success) {
      resetForm()
    }

    if (result.serverError) {
      setError("root", {
        message:
          "We could not resend the verification email right now. Please try again.",
      })
    }
  }, [resetForm, result, setError])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const onSubmit = (values: ResendVerificationFormInput) => {
    clearErrors()
    execute(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="resendEmail" className="sr-only">
            Email address
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="mr-2 text-muted-foreground">
                <Mail className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="resendEmail"
              type="email"
              autoComplete="email"
              placeholder="Confirm your email address"
              disabled={isPending}
              aria-invalid={Boolean(errors.email)}
              className="bg-background/80"
              {...register("email")}
            />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>

      <FieldError errors={[errors.root]} />

      {result.data?.success ? (
        <p className="text-sm text-muted-foreground">{result.data.success}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Sending..." : "Send again"}
      </Button>
    </form>
  )
}
