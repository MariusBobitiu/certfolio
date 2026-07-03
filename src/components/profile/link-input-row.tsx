"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LINK_PLATFORMS,
  PLATFORM_ICONS,
  type LinkPlatform,
} from "@/lib/validations/profile"
import type { ProfileFormData } from "@/lib/validations/profile"

const PLATFORM_LABELS: Record<LinkPlatform, string> = {
  website: "Website",
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  dribbble: "Dribbble",
  figma: "Figma",
  facebook: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
}

type LinkRowProps = {
  index: number
  usedPlatforms: Set<string>
  onRemove: (index: number) => void
  error?: {
    label?: { message?: string }
    url?: { message?: string }
  }
}

export function LinkInputRow({
  index,
  usedPlatforms,
  onRemove,
  error,
}: LinkRowProps) {
  const { register, setValue, watch } = useFormContext<ProfileFormData>()
  const platform = watch(`links.${index}.platform`) as LinkPlatform | undefined

  // Auto-set label to platform name when platform changes (except website which is user-defined)
  useEffect(() => {
    if (platform && platform !== "website") {
      setValue(`links.${index}.label`, PLATFORM_LABELS[platform])
    }
  }, [platform, index, setValue])

  // Filter: hide platforms already used by other links, except "website" (allowed multiple times)
  const available = LINK_PLATFORMS.filter(
    (p) => p === "website" || p === platform || !usedPlatforms.has(p)
  )

  return (
    <div className="flex items-start gap-3">
      {/* Platform selector */}
      <div className="w-32 shrink-0">
        <Select
          value={platform ?? "website"}
          onValueChange={(value) =>
            setValue(`links.${index}.platform`, value as LinkPlatform)
          }
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {available.map((p) => (
              <SelectItem key={p} value={p}>
                <span className="flex items-center gap-1.5">
                  <Image
                    src={PLATFORM_ICONS[p]}
                    alt={p}
                    width={14}
                    height={14}
                    className="size-3.5"
                  />
                  <span>{PLATFORM_LABELS[p]}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Label input — only visible for "website", hidden for other platforms */}
      {platform === "website" ? (
        <div className="w-32 shrink-0">
          <Input
            {...register(`links.${index}.label`)}
            placeholder="e.g. Portfolio"
            className="h-9 text-sm"
          />
          {error?.label && (
            <p className="mt-1 text-xs text-destructive">
              {error.label.message}
            </p>
          )}
        </div>
      ) : (
        <input type="hidden" {...register(`links.${index}.label`)} />
      )}

      {/* URL */}
      <div className="flex-1">
        <Input
          {...register(`links.${index}.url`)}
          placeholder="https://..."
          className="h-9 text-sm"
        />
        {error?.url && (
          <p className="mt-1 text-xs text-destructive">{error.url.message}</p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-0.5 size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(index)}
        aria-label="Remove link"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
