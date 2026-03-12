import {
  getClearedSessionCookie,
  revokeSessionByCookie,
} from "@/lib/auth/session"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  console.log("Signing out user...", req.url)

  await revokeSessionByCookie()

  const response = NextResponse.redirect(new URL("/sign-in", req.url))
  const clearedCookie = getClearedSessionCookie()

  response.cookies.set(
    clearedCookie.name,
    clearedCookie.value,
    clearedCookie.options
  )

  return response
}
