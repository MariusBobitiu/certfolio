import { z } from "zod/v4"

export const verifyMfaCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
})

export type VerifyMfaCodeInput = z.input<typeof verifyMfaCodeSchema>
export type VerifyMfaCodeOutput = z.output<typeof verifyMfaCodeSchema>
