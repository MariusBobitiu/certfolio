"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { updateProfileAction } from "./action"
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "./schema"

export function GeneralForm({
  defaultValues,
}: {
  defaultValues: UpdateProfileInput
}) {
  const router = useRouter()
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: standardSchemaResolver(updateProfileSchema),
    defaultValues: {
      ...defaultValues,
      password: "",
    },
  })

  const { execute, isPending, result } = useAction(updateProfileAction)

  useEffect(() => {
    if (result.data && "requiresPasswordConfirmation" in result.data) {
      setPasswordRequired(true)
      setPasswordError(result.data.failure ?? "Confirm your password to continue.")
      return
    }

    if (result.data?.failure) {
      setError("root", { message: result.data.failure })
    }
    if (result.data?.success) {
      setPasswordRequired(false)
      setPasswordError(null)
      toast.success(result.data.success)
      reset({
        ...defaultValues,
        password: "",
      })
      router.refresh()
    }
  }, [defaultValues, reset, result, router, setError])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">General</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => {
          clearErrors("root")
          setPasswordError(null)
          execute(values)
        })}
        className="space-y-6"
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              placeholder="Your name"
              disabled={isPending}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.slug)}>
            <FieldLabel htmlFor="slug">Username</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>certfolio.app/u/</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="slug"
                placeholder="your-username"
                disabled={isPending}
                {...register("slug")}
              />
            </InputGroup>
            <FieldError errors={[errors.slug]} />
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Primary Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isPending}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          {passwordRequired ? (
            <Field data-invalid={Boolean(errors.password) || Boolean(passwordError)}>
              <FieldLabel htmlFor="password">Confirm your password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isPending}
                {...register("password")}
              />
              <FieldError
                errors={[
                  errors.password,
                  passwordError ? { message: passwordError } : undefined,
                ]}
              />
            </Field>
          ) : null}
        </FieldGroup>

        <FieldError errors={[errors.root]} />

        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="size-4" />}
          Save Changes
        </Button>
      </form>
    </div>
  )
}
