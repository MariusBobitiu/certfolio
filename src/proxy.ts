import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./data/session";

export async function proxy(req: NextRequest) {	
	if (!req.cookies.has("cfl_session")) {
		// If the session cookie is not present, we can return a 401 Unauthorized response or redirect to the sign-in page
		return NextResponse.redirect(`${process.env.CLIENT_URL}/sign-in`);
	}

	// Now we verify the session based on the cookie value
	const sessionCookie = req.cookies.get("cfl_session");
	if (!sessionCookie) {
		console.warn("Session cookie 'cfl_session' not found.");
		return NextResponse.redirect(`${process.env.CLIENT_URL}/sign-in`);
	}

	const session = await verifySession(sessionCookie.value);
	if (!session || !session.isValid) {
		console.warn("Invalid session, redirecting to sign-in page.");
		return NextResponse.redirect(`${process.env.CLIENT_URL}/sign-in`);
	}

	// If the session is valid, we can proceed with the request
	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard', '/dashboard/:path*', '/account', '/account/:path*', '/settings', '/settings/:path*'],
};