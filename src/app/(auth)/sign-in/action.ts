"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { verify } from "@node-rs/argon2"
import { actionClient } from "@/lib/safe-action"
import { db, UsersTable } from "@/lib/db/drizzle"
import {
  createSession,
  getRequestSessionContext,
  setSessionCookie,
} from "@/lib/auth/session"
import {
  getEnabledMfaMethods,
  issueEmailMfaChallenge,
  setPendingMfaCookie,
} from "@/lib/auth/mfa"
import { signInSchema } from "./schema"

export const signInAction = actionClient
  .inputSchema(signInSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, rememberMe } = parsedInput

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, email))
      .limit(1)

    if (!user) {
      return { failure: "Invalid email or password" }
    }

    if (user.deleted_at) {
      return { failure: "This account has been deleted" }
    }

    if (user.archived_at) {
      return {
        failure:
          "This account has been deactivated. Contact support to reactivate.",
      }
    }

    const passwordValid = await verify(user.password_hash, password)

    if (!passwordValid) {
      return { failure: "Invalid email or password" }
    }

    const { ipAddress, city, userAgent } = await getRequestSessionContext()
    const enabledMfaMethods = await getEnabledMfaMethods(user.id)
    const emailMfaEnabled = enabledMfaMethods.some(
      (method) => method.method === "email"
    )

    if (emailMfaEnabled) {
      const challenge = await issueEmailMfaChallenge({
        userId: user.id,
        email: user.email,
        name: user.name,
        rememberMe,
        ipAddress,
        city,
        userAgent,
      })

      await setPendingMfaCookie({
        method: "email",
        userId: user.id,
        verificationId: challenge.verificationId,
      })

      redirect("/mfa")
    }

    const { token } = await createSession(user.id, {
      rememberMe,
      ipAddress,
      city,
      userAgent,
    })

    await setSessionCookie(token, rememberMe)

    redirect("/dashboard")
  })
