import * as z from "zod/v4"

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email"),
})

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>
export type ForgotPasswordOutput = z.output<typeof forgotPasswordSchema>
