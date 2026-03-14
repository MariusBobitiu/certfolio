"use server"

import { randomBytes } from "node:crypto"

import { hash } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { RATE_LIMIT_CONFIG } from "@/lib/consts"
import { consumeRateLimit } from "@/lib/auth/rate-limit"
import { actionClient } from "@/lib/safe-action"
import {
  logEmailVerificationSentEvent,
  sendEmailVerification,
  setPendingEmailVerificationCookie,
} from "@/lib/auth/email-verification"
import { getRequestSessionContext } from "@/lib/auth/session"
import { db, UsersTable } from "@/lib/db/drizzle"

import { signUpSchema } from "./schema"

function generateSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")

  return base || "user"
}

async function isSlugAvailable(slug: string) {
  const [existingSlug] = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(eq(UsersTable.slug, slug))
    .limit(1)

  return !existingSlug
}

async function generateAvailableSlug(name: string) {
  const baseSlug = generateSlug(name)

  if (await isSlugAvailable(baseSlug)) {
    return baseSlug
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = randomBytes(3).toString("hex")
    const candidateSlug = `${baseSlug}-${suffix}`

    if (await isSlugAvailable(candidateSlug)) {
      return candidateSlug
    }
  }

  throw new Error("Unable to generate an available slug")
}

function getAvatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}`
}

export const signUpAction = actionClient
  .inputSchema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password } = parsedInput

    const normalizedEmail = email.toLowerCase().trim()
    const { ipAddress } = await getRequestSessionContext()

    if (ipAddress) {
      const ipLimit = await consumeRateLimit({
        scope: "sign_up:ip",
        key: ipAddress,
        maxAttempts: RATE_LIMIT_CONFIG.SIGN_UP.IP_MAX_ATTEMPTS,
        windowMs: RATE_LIMIT_CONFIG.SIGN_UP.WINDOW_MS,
      })

      if (!ipLimit.allowed) {
        return { failure: "Too many sign-up attempts. Try again later." }
      }
    }

    const accountLimit = await consumeRateLimit({
      scope: "sign_up:account",
      key: normalizedEmail,
      maxAttempts: RATE_LIMIT_CONFIG.SIGN_UP.ACCOUNT_MAX_ATTEMPTS,
      windowMs: RATE_LIMIT_CONFIG.SIGN_UP.WINDOW_MS,
    })

    if (!accountLimit.allowed) {
      return { failure: "Too many sign-up attempts. Try again later." }
    }

    const [existingUser] = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(eq(UsersTable.email, normalizedEmail))
      .limit(1)

    if (existingUser) {
      return { failure: "An account with this email already exists" }
    }

    const passwordHash = await hash(password)
    const slug = await generateAvailableSlug(name)

    const [user] = await db
      .insert(UsersTable)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        image: getAvatarUrl(name),
        slug,
      })
      .returning()

    try {
      await sendEmailVerification({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
      await logEmailVerificationSentEvent(user.id, user.email, "sign_up")
      await setPendingEmailVerificationCookie({
        userId: user.id,
        email: user.email,
      })
    } catch (error) {
      console.error("Failed to send verification email after sign-up:", error)
    }

    redirect("/verify-email")
  })
