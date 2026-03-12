"use server"

import { randomBytes } from "node:crypto"

import { hash } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { actionClient } from "@/lib/safe-action"
import {
  createSession,
  getRequestSessionContext,
  setSessionCookie,
} from "@/lib/auth/session"
import { sendEmailVerification } from "@/lib/auth/email-verification"
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
    const { name, email, password, rememberMe } = parsedInput

    const normalizedEmail = email.toLowerCase().trim()

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

    const { ipAddress, userAgent } = await getRequestSessionContext()

    const { token } = await createSession(user.id, {
      rememberMe,
      ipAddress,
      userAgent,
    })

    await setSessionCookie(token, rememberMe)

    try {
      await sendEmailVerification({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
    } catch (error) {
      console.error("Failed to send verification email after sign-up:", error)
    }

    redirect("/dashboard")
  })
