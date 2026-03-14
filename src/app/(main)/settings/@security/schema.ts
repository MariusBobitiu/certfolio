import * as z from "zod/v4"

export const sensitiveActionSchema = z.object({
  password: z.string().trim().optional(),
})

export type SensitiveActionInput = z.input<typeof sensitiveActionSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ChangePasswordInput = z.input<typeof changePasswordSchema>

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
})

export type RevokeSessionInput = z.input<typeof revokeSessionSchema>

export const totpCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
  password: z.string().trim().optional(),
})

export type TotpCodeInput = z.input<typeof totpCodeSchema>
