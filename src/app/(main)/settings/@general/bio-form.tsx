"use client"

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { updateBioAction } from "./bio-action"

const MAX_BIO_LENGTH = 500

export function BioForm({ defaultBio }: { defaultBio: string }) {
  const [bio, setBio] = useState(defaultBio)
  const { execute, isPending, result } = useAction(updateBioAction)

  useEffect(() => {
    if (result.data?.success) {
      toast.success(result.data.success)
    }
    if (result.data?.failure) {
      toast.error(result.data.failure)
    }
  }, [result])

  const remaining = MAX_BIO_LENGTH - bio.length
  const isOverLimit = remaining < 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Public Bio</h2>
        <p className="text-sm text-muted-foreground">
          A short bio shown on your public profile. Keep it concise and professional.
        </p>
      </div>

      <div className="space-y-4">
        <Field data-invalid={isOverLimit ? true : undefined}>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            placeholder="A brief professional summary — what you do, what you're focused on, or what makes your work credible."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isPending}
            rows={4}
          />
          <div className="flex items-start justify-between gap-3">
            {isOverLimit ? (
              <FieldError errors={[{ message: `Bio must be ${MAX_BIO_LENGTH} characters or fewer` }]} />
            ) : (
              <span />
            )}
            <p className={`shrink-0 text-xs ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
              {remaining} remaining
            </p>
          </div>
        </Field>

        <Button
          onClick={() => execute({ bio })}
          disabled={isPending || isOverLimit}
        >
          {isPending && <Spinner className="size-4" />}
          Save Bio
        </Button>
      </div>
    </div>
  )
}
