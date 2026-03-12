import * as z from "zod/v4"
import { validatePassword } from "@/lib/auth/password-validation"

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .superRefine((password, ctx) => {
        const validation = validatePassword(password)
        if (!validation.valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Password must contain ${validation.errors.join(", ")}`,
          })
        }
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type ResetPasswordInput = z.input<typeof resetPasswordSchema>
export type ResetPasswordOutput = z.output<typeof resetPasswordSchema>
