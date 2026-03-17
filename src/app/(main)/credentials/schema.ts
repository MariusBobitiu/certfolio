import * as z from "zod/v4"

const monthPrecisionSchema = z.string().regex(/^\d{4}-\d{2}$/)

const credentialBaseSchema = z
  .object({
    title: z.string().trim().min(1, "Credential title is required"),
    issuerId: z.string().trim().optional().default(""),
    customIssuerName: z.string().trim().optional().default(""),
    issuedOn: monthPrecisionSchema,
    expiresOn: z.string().trim().optional().default(""),
    verificationUrl: z.string().trim().optional().default(""),
    verificationCode: z.string().trim().optional().default(""),
    certificateAssetKey: z.string().trim().optional().default(""),
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

    if (value.expiresOn.trim() && !monthPrecisionSchema.safeParse(value.expiresOn.trim()).success) {
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

export const createCredentialSchema = credentialBaseSchema

export type CreateCredentialInput = z.input<typeof createCredentialSchema>

export const updateCredentialSchema = credentialBaseSchema.safeExtend({
  slug: z.string().trim().min(1, "Credential slug is required"),
  status: z.enum(["draft", "published", "archived"]),
})

export type UpdateCredentialInput = z.input<typeof updateCredentialSchema>

export const deleteCredentialSchema = z.object({
  slug: z.string().trim().min(1, "Credential slug is required"),
})

export type DeleteCredentialInput = z.input<typeof deleteCredentialSchema>
