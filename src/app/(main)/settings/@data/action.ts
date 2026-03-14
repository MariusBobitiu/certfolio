"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import * as z from "zod/v4"
import { actionClient } from "@/lib/safe-action"
import { requireRecentPasswordConfirmation } from "@/lib/auth/recent-password"
import {
  clearSessionCookie,
  getCurrentSession,
  revokeUserSessions,
  revokeSessionByCookie,
} from "@/lib/auth/session"
import { revokeTrustedMfaDevices } from "@/lib/auth/mfa"
import { db, UsersTable } from "@/lib/db/drizzle"
import { deleteAccountSchema, exportDataSchema } from "./schema"

const confirmPasswordSchema = z.object({
  password: z.string().trim().optional(),
})

export const exportProfileAction = actionClient
  .inputSchema(exportDataSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const { user } = session
    const profileData = {
      name: user.name,
      email: user.email,
      slug: user.slug,
      created_at: user.created_at,
      email_verified_at: user.email_verified_at,
    }

    if (parsedInput.format === "json") {
      return { data: JSON.stringify(profileData, null, 2), filename: "profile.json" }
    }

    const csvHeader = Object.keys(profileData).join(",")
    const csvRow = Object.values(profileData)
      .map((v) => `"${String(v ?? "")}"`)
      .join(",")

    return { data: `${csvHeader}\n${csvRow}`, filename: "profile.csv" }
  })

export const exportCredentialsAction = actionClient
  .inputSchema(exportDataSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    // Placeholder — credentials feature doesn't exist yet
    const credentials: Record<string, unknown>[] = []

    if (parsedInput.format === "json") {
      return { data: JSON.stringify(credentials, null, 2), filename: "credentials.json" }
    }

    return { data: "", filename: "credentials.csv" }
  })

export const deactivateAccountAction = actionClient
  .inputSchema(confirmPasswordSchema)
  .action(async ({ parsedInput }) => {
  const session = await getCurrentSession()
  if (!session) return { failure: "Unauthorized" }

  const confirmation = await requireRecentPasswordConfirmation(
    session,
    parsedInput.password
  )

  if (!confirmation.success) {
    return confirmation
  }

  await db
    .update(UsersTable)
    .set({ archived_at: new Date(), updated_at: new Date() })
    .where(eq(UsersTable.id, session.user.id))

  await revokeTrustedMfaDevices(session.user.id)
  await revokeUserSessions(session.user.id, { excludeSessionId: session.session.id })
  await revokeSessionByCookie()
  await clearSessionCookie()

  redirect("/sign-in")
})

export const deleteAccountAction = actionClient
  .inputSchema(deleteAccountSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) return { failure: "Unauthorized" }

    const confirmation = await requireRecentPasswordConfirmation(
      session,
      parsedInput.password
    )

    if (!confirmation.success) {
      return confirmation
    }

    if (parsedInput.confirmEmail !== session.user.email) {
      return { failure: "Email does not match your account" }
    }

    await db
      .update(UsersTable)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(eq(UsersTable.id, session.user.id))

    await revokeTrustedMfaDevices(session.user.id)
    await revokeUserSessions(session.user.id, { excludeSessionId: session.session.id })
    await revokeSessionByCookie()
    await clearSessionCookie()

    redirect("/sign-in")
  })
