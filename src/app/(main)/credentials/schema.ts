import * as z from "zod/v4"

export const createCredentialSchema = z
  .object({
    title: z.string().trim().min(1, "Credential title is required"),
    issuerId: z.string().trim().optional().default(""),
    customIssuerName: z.string().trim().optional().default(""),
    issuedOn: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Issue date is required"),
    expiresOn: z.string().trim().optional().default(""),
    verificationUrl: z.string().trim().optional().default(""),
    verificationCode: z.string().trim().optional().default(""),
    summary: z.string().trim().optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (!value.issuerId && !value.customIssuerName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["customIssuerName"],
        message: "Choose an issuer or type a custom issuer",
      })
    }

    if (value.verificationUrl.trim()) {
      const result = z.url().safeParse(value.verificationUrl.trim())
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["verificationUrl"],
          message: "Enter a valid verification URL",
        })
      }
    }

    if (value.expiresOn.trim() && !/^\d{4}-\d{2}$/.test(value.expiresOn.trim())) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresOn"],
        message: "Expiry date must include a month and year",
      })
    }

    if (value.expiresOn.trim() && value.expiresOn < value.issuedOn) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresOn"],
        message: "Expiry date must be after the issue date",
      })
    }
  })

export type CreateCredentialInput = z.input<typeof createCredentialSchema>
