import * as z from "zod/v4"

export const updatePrivacySchema = z.object({
  public_profile: z.boolean(),
  searchable: z.boolean(),
  show_email: z.boolean(),
  full_metadata: z.boolean(),
})

export type UpdatePrivacyInput = z.input<typeof updatePrivacySchema>
