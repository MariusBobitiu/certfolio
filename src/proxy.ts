import { NextRequest, NextResponse } from "next/server"
import {
  SESSION_COOKIE_NAME,
  validateSessionToken,
} from "@/lib/auth/session-core"

function redirectToSignIn(req: NextRequest) {
  return NextResponse.redirect(new URL("/sign-in", req.url))
}

export async function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return redirectToSignIn(req)
  }

  const session = await validateSessionToken(sessionCookie.value)

  if (!session) {
    return redirectToSignIn(req)
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
