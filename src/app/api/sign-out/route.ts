import {
  getClearedSessionCookie,
  revokeSessionByCookie,
} from "@/lib/auth/session"
import { NextResponse } from "next/server"

function getSignInLocation() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL

  return appUrl ? new URL("/sign-in", appUrl).toString() : "/sign-in"
}

async function signOut() {
  await revokeSessionByCookie()

  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: getSignInLocation() },
  })
  const clearedCookie = getClearedSessionCookie()

  response.cookies.set(
    clearedCookie.name,
    clearedCookie.value,
    clearedCookie.options
  )

  return response
}

export const GET = signOut
export const POST = signOut
