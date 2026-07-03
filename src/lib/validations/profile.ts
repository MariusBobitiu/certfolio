import { z } from "zod"

export const LINK_PLATFORMS = [
  "website",
  "github",
  "linkedin",
  "twitter",
  "dribbble",
  "figma",
  "facebook",
  "instagram",
  "threads",
] as const

export type LinkPlatform = (typeof LINK_PLATFORMS)[number]

export const PLATFORM_ICONS: Record<LinkPlatform, string> = {
  website: "/cdn/icons/website.svg",
  github: "/cdn/icons/github.svg",
  linkedin: "/cdn/icons/linkedin.svg",
  twitter: "/cdn/icons/x-twitter.svg",
  dribbble: "/cdn/icons/dribbble.svg",
  figma: "/cdn/icons/figma.svg",
  facebook: "/cdn/icons/facebook.svg",
  instagram: "/cdn/icons/instagram.svg",
  threads: "/cdn/icons/threads.svg",
}

const linkSchema = z.object({
  id: z.string().optional(),
  platform: z.enum(LINK_PLATFORMS).default("website"),
  label: z.string().min(1, "Label is required").max(30, "Label too long"),
  url: z.string().min(1, "URL is required").url("Must be a valid URL"),
})

export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, hyphens, and underscores"
    ),
  headline: z.string().max(120, "Headline too long").default(""),
  bio: z.string().max(500, "Bio too long").default(""),
  links: z.array(linkSchema).max(10, "Maximum 10 links").default([]),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

export const slugAvailabilitySchema = z.object({
  slug: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, hyphens, and underscores"
    ),
})

export const profileVisibilitySchema = z.object({
  publicProfile: z.boolean(),
})
