"use server"

import { getCurrentSession, validateSessionToken } from "@/lib/auth/session"

export const getSession = async () => {
  return getCurrentSession()
}

export const verifySession = async (cookieValue: string) => {
  try {
    const session = await validateSessionToken(cookieValue)

    return {
      isValid: Boolean(session),
      session,
    }
  } catch (error) {
    console.error("Error verifying session:", error)
    return {
      isValid: false,
      session: null,
    }
  }
}
