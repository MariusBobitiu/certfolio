import "server-only"
import { cookies, headers } from "next/headers"
import {
  SESSION_COOKIE_NAME,
  getSessionTtlSeconds,
  revokeSession,
  validateSessionToken,
} from "./session-core"

export {
  SESSION_COOKIE_NAME,
  createSession,
  hashSessionToken,
  markSessionReauthenticated,
  revokeSessionById,
  revokeUserSessions,
  validateSessionToken,
} from "./session-core"

export async function setSessionCookie(token: string, rememberMe: boolean) {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: getSessionTtlSeconds(true) } : {}),
  })
}

export function getClearedSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: new Date(0),
    },
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  const clearedCookie = getClearedSessionCookie()

  cookieStore.set(
    clearedCookie.name,
    clearedCookie.value,
    clearedCookie.options
  )
}

export async function revokeSessionByCookie() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return
  }

  await revokeSession(sessionCookie.value)
}

export async function getCurrentSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  return validateSessionToken(sessionCookie.value)
}

export async function getRequestSessionContext() {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get("x-forwarded-for")
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null
  const city =
    requestHeaders.get("x-vercel-ip-city") ??
    requestHeaders.get("cf-ipcity") ??
    requestHeaders.get("x-appengine-city") ??
    null
  const userAgent = requestHeaders.get("user-agent")

  return { ipAddress, city, userAgent }
}
