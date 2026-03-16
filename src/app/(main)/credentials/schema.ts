import * as z from "zod/v4"

const createSourceTypeSchema = z.enum(["credly", "issuer_link", "manual"])

export const createCredentialSchema = z
  .object({
    title: z.string().trim().min(1, "Credential title is required"),
    issuerId: z.string().trim().optional().default(""),
    customIssuerName: z.string().trim().optional().default(""),
    sourceType: createSourceTypeSchema,
    issuedOn: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Issue month is required"),
    verificationUrl: z.string().trim().optional().default(""),
    credentialCode: z.string().trim().optional().default(""),
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

    if (
      (value.sourceType === "credly" || value.sourceType === "issuer_link") &&
      !value.verificationUrl.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["verificationUrl"],
        message: "Verification URL is required for external links",
      })
      return
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
  })

export type CreateCredentialInput = z.input<typeof createCredentialSchema>
