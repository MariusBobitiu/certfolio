import * as z from "zod/v4"

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  email: z.email("Please enter a valid email"),
  password: z.string().trim().optional(),
})

export type UpdateProfileInput = z.input<typeof updateProfileSchema>
