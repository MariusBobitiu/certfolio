import * as z from "zod/v4"

export const exportDataSchema = z.object({
  format: z.enum(["json", "csv"]),
})

export type ExportDataInput = z.input<typeof exportDataSchema>

export const deleteAccountSchema = z.object({
  confirmEmail: z.email("Please enter a valid email"),
  password: z.string().trim().optional(),
})

export type DeleteAccountInput = z.input<typeof deleteAccountSchema>
