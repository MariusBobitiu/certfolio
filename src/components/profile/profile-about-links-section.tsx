"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LinkInputRow } from "@/components/profile/link-input-row"
import { ProfileSectionHeader } from "@/components/profile/profile-section-header"
import type { ProfileFormData } from "@/lib/validations/profile"

export function ProfileAboutLinksSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<ProfileFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  })

  const bioValue = watch("bio")
  const links = watch("links")

  // Collect platforms used by other links (excluding current index)
  const getUsedPlatforms = (currentIndex: number): Set<string> => {
    const used = new Set<string>()
    links?.forEach((link, i) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = ((link as any)?.platform as string | undefined) ?? ""
      if (i !== currentIndex && p !== "") {
        used.add(p)
      }
    })
    return used
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <ProfileSectionHeader
            label="About & links"
            subtitle="Tell visitors who you are and where to find you."
          />

          <div className="space-y-1.5">
            <Label
              htmlFor="bio"
              className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Bio
            </Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Write a short bio that summarises your professional identity…"
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
              <p className="ml-auto text-xs text-muted-foreground">
                {bioValue?.length ?? 0}/500
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Links
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() =>
                append({ platform: "website", label: "Website", url: "" })
              }
              disabled={fields.length >= 10}
            >
              <Plus className="size-3" />
              Add link
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              No links yet. Add your website, GitHub, or LinkedIn.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <LinkInputRow
                  key={field.id}
                  index={index}
                  usedPlatforms={getUsedPlatforms(index)}
                  onRemove={remove}
                  error={errors.links?.[index]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
