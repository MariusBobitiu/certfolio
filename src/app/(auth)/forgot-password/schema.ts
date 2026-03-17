import * as z from "zod/v4"

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email"),
})

export const verifyForgotPasswordCodeSchema = z.object({
  email: z.email("Please enter a valid email"),
  code: z
    .string()
    .min(1, "Reset code is required")
    .transform((value) => value.trim().toUpperCase()),
})

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>
export type ForgotPasswordOutput = z.output<typeof forgotPasswordSchema>
export type VerifyForgotPasswordCodeInput = z.input<
  typeof verifyForgotPasswordCodeSchema
>
export type VerifyForgotPasswordCodeOutput = z.output<
  typeof verifyForgotPasswordCodeSchema
>
