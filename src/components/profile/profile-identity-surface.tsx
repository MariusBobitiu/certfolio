"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import Link from "next/link"
import { useFormContext } from "react-hook-form"
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Save,
} from "lucide-react"
import { toast } from "sonner"

import {
  AvatarUploadZone,
  getInitials,
} from "@/components/profile/avatar-upload-zone"
import { ProfileCompleteness } from "@/components/profile/profile-completeness"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  checkSlugAvailability,
  setProfileVisibility,
} from "@/data/profile-management"
import { updateAppearanceAction } from "@/app/(main)/settings/@appearance/action"
import type { ProfileFormData } from "@/lib/validations/profile"
import { cn } from "@/lib/utils"

const PRESET_HEX: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  pink: "#ec4899",
  zinc: "#71717a",
}

const PRESET_NAMES = Object.keys(PRESET_HEX)

type ProfileIdentitySurfaceProps = {
  currentImageUrl: string | null
  previewUrl: string | null
  onImageSelectAction: (file: File) => void
  userId: string
  initialSlug: string
  isDirty: boolean
  isSaving: boolean
  onSaveAction: () => Promise<void>
  publicSlug: string
  isPublic: boolean
  accentColour: string
  // Completeness props
  hasImage: boolean
  hasHeadline: boolean
  hasBio: boolean
  hasLinks: boolean
  featuredCredsCount: number
  featuredProjectsCount: number
}

export function ProfileIdentitySurface({
  currentImageUrl,
  previewUrl,
  onImageSelectAction,
  userId,
  initialSlug,
  isDirty,
  isSaving,
  onSaveAction,
  publicSlug,
  isPublic: initialIsPublic,
  accentColour,
  hasImage,
  hasHeadline,
  hasBio,
  hasLinks,
  featuredCredsCount,
  featuredProjectsCount,
}: ProfileIdentitySurfaceProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProfileFormData>()

  const name = watch("name")
  const slug = watch("slug")

  // Slug inline edit
  const [isEditingSlug, setIsEditingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<{
    state: "idle" | "checking" | "available" | "taken"
  }>({ state: "idle" })

  const checkSlug = useCallback(
    async (value: string) => {
      if (value === initialSlug || value.length < 3) {
        setSlugStatus({ state: "idle" })
        return
      }
      setSlugStatus({ state: "checking" })
      try {
        const available = await checkSlugAvailability(value, userId)
        setSlugStatus({ state: available ? "available" : "taken" })
      } catch {
        setSlugStatus({ state: "idle" })
      }
    },
    [initialSlug, userId]
  )

  useEffect(() => {
    if (!isEditingSlug || !slug) return
    const timeout = setTimeout(() => checkSlug(slug), 500)
    return () => clearTimeout(timeout)
  }, [slug, isEditingSlug, checkSlug])

  // Visibility state
  const [profileIsPublic, setProfileIsPublic] = useState(initialIsPublic)
  const [isPendingVis, startTransitionVis] = useTransition()

  const handleToggleVisibility = () => {
    const next = !profileIsPublic
    setProfileIsPublic(next)
    startTransitionVis(async () => {
      try {
        await setProfileVisibility(userId, next)
        toast.success(next ? "Profile is now public" : "Profile is now private")
      } catch {
        setProfileIsPublic(!next)
        toast.error("Failed to update visibility")
      }
    })
  }

  // Accent colour — convert legacy preset names to hex
  const initialColour = PRESET_HEX[accentColour] ?? accentColour
  const [selectedColour, setSelectedColour] = useState(initialColour)
  const [isPendingAccent, startTransitionAccent] = useTransition()

  const handleAccentChange = (hex: string) => {
    setSelectedColour(hex)
    startTransitionAccent(async () => {
      try {
        await updateAppearanceAction({ accent_colour: hex })
        toast.success("Accent colour updated")
      } catch {
        setSelectedColour(initialColour)
        toast.error("Failed to update accent")
      }
    })
  }

  // Copy link
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    const url = `${window.location.origin}/u/${publicSlug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Profile link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const showImage = !!(previewUrl || currentImageUrl)
  const initials = getInitials(name || "User")

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

      <div className="p-6 sm:p-8">
        {/* Context label + URL */}
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Your public profile
          </p>
          <p className="text-xs text-muted-foreground">
            certfolio.com/u/{publicSlug}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: avatar + identity fields */}
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 lg:flex-1">
            <div className="shrink-0">
              <AvatarUploadZone
                currentImageUrl={currentImageUrl}
                name={name || "User"}
                previewUrl={previewUrl}
                onFileSelectAction={onImageSelectAction}
              />
              {!showImage && (
                <div className="mt-2 hidden size-12 items-center justify-center rounded-2xl border border-border bg-linear-to-br from-primary/15 via-secondary to-card text-lg font-semibold tracking-tight shadow-sm ring-1 ring-primary/20 sm:flex sm:size-14 sm:text-xl">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-5">
              {/* Name */}
              <div>
                <input
                  {...register("name")}
                  placeholder="Your name"
                  className="w-full bg-transparent text-2xl font-semibold tracking-[-0.04em] text-foreground outline-none placeholder:text-muted-foreground/40 sm:text-3xl"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              {isEditingSlug ? (
                <div className="space-y-1">
                  <div className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3">
                    <span className="shrink-0 text-sm text-muted-foreground">
                      certfolio.com/u/
                    </span>
                    <input
                      {...register("slug")}
                      autoFocus
                      placeholder="username"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                      onBlur={() => setIsEditingSlug(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          setIsEditingSlug(false)
                        }
                      }}
                    />
                    {slugStatus.state === "checking" && (
                      <span className="shrink-0 animate-pulse text-xs text-muted-foreground">
                        Checking…
                      </span>
                    )}
                    {slugStatus.state === "available" && (
                      <span className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400">
                        Available
                      </span>
                    )}
                    {slugStatus.state === "taken" && (
                      <span className="shrink-0 text-xs text-destructive">
                        Taken
                      </span>
                    )}
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(true)}
                  className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="font-medium">@{slug || "username"}</span>
                  <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )}

              {/* Headline */}
              <div>
                <input
                  {...register("headline")}
                  placeholder="Add a short headline about yourself…"
                  maxLength={120}
                  className="w-full bg-transparent text-base text-foreground/80 outline-none placeholder:text-muted-foreground/40"
                />
                {errors.headline && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.headline.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right column: visibility + accent */}
          <div className="flex flex-col gap-4 lg:w-52 lg:shrink-0 lg:border-l lg:border-border/60 lg:pl-6">
            {/* Visibility status */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVisibility}
                disabled={isPendingVis}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  profileIsPublic
                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                )}
                aria-label={
                  profileIsPublic
                    ? "Make profile private"
                    : "Make profile public"
                }
              >
                {profileIsPublic ? (
                  <Globe className="size-3.5" />
                ) : (
                  <Lock className="size-3.5" />
                )}
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  {profileIsPublic ? "Public" : "Private"}
                </span>
                <button
                  type="button"
                  onClick={handleToggleVisibility}
                  disabled={isPendingVis}
                  className="text-left text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {profileIsPublic ? "Make private" : "Make public"}
                </button>
              </div>
            </div>

            {/* Accent colour */}
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_NAMES.map((name) => {
                const hex = PRESET_HEX[name]!
                const isActive = selectedColour === hex
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleAccentChange(hex)}
                    disabled={isPendingAccent}
                    className={cn(
                      "block size-3.5 rounded-full transition-all",
                      isActive
                        ? "scale-110 ring-2 ring-foreground ring-offset-1 ring-offset-card"
                        : "ring-1 ring-transparent hover:ring-muted-foreground/50"
                    )}
                    style={{ backgroundColor: hex }}
                    aria-label={`Accent: ${name}`}
                  />
                )
              })}
              <ColorPicker
                value={selectedColour}
                onChange={handleAccentChange}
              />
            </div>
          </div>
        </div>

        {/* Actions row + completeness */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Actions — left */}
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="mr-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Unsaved
              </span>
            )}

            <Button
              onClick={onSaveAction}
              disabled={!isDirty || isSaving}
              size="sm"
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save changes
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/u/${publicSlug}` as const}
                target="_blank"
                className="gap-1.5"
              >
                <ExternalLink className="size-3.5" />
                View public
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              Copy link
            </Button>
          </div>

          {/* Completeness — right */}
          <div className="w-56 shrink-0">
            <ProfileCompleteness
              hasImage={hasImage}
              hasHeadline={hasHeadline}
              hasBio={hasBio}
              hasLinks={hasLinks}
              featuredCredsCount={featuredCredsCount}
              featuredProjectsCount={featuredProjectsCount}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
