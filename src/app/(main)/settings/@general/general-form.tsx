"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
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
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: standardSchemaResolver(updateProfileSchema),
    defaultValues,
  })

  const { execute, isPending, result } = useAction(updateProfileAction)

  useEffect(() => {
    if (result.data?.failure) {
      setError("root", { message: result.data.failure })
    }
    if (result.data?.success) {
      toast.success(result.data.success)
    }
  }, [result, setError])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">General</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => execute(values))}
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
