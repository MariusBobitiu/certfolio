import * as z from "zod/v4"

export const ACCENT_COLOURS = [
  "blue",
  "purple",
  "emerald",
  "amber",
  "red",
  "pink",
  "zinc",
] as const

export const updateAppearanceSchema = z.object({
  accent_colour: z.string().min(1),
})

export type UpdateAppearanceInput = z.input<typeof updateAppearanceSchema>
