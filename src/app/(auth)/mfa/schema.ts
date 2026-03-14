import { z } from "zod/v4"

export const verifyMfaCodeSchema = z.object({
  code: z.string().trim().min(1, "Enter your code"),
  codeType: z.enum(["totp", "recovery"]).default("totp"),
  rememberDevice: z.boolean().default(false),
})

export type VerifyMfaCodeInput = z.input<typeof verifyMfaCodeSchema>
export type VerifyMfaCodeOutput = z.output<typeof verifyMfaCodeSchema>
