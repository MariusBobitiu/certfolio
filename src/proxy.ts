import { NextRequest, NextResponse } from "next/server"
import {
  SESSION_COOKIE_NAME,
  validateSessionToken,
} from "@/lib/auth/session-core"

function getSignInLocation() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL

  return appUrl ? new URL("/sign-in", appUrl).toString() : "/sign-in"
}

function redirectToSignIn() {
  return new NextResponse(null, {
    status: 307,
    headers: { Location: getSignInLocation() },
  })
}

export async function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return redirectToSignIn()
  }

  const session = await validateSessionToken(sessionCookie.value)

  if (!session) {
    return redirectToSignIn()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/account",
    "/account/:path*",
    "/settings",
    "/settings/:path*",
  ],
}
