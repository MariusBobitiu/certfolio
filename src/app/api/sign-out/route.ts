import { NextResponse } from "next/server";

export async function GET(req: Request) {
	console.log("Signing out user...", req.url);

	const response = NextResponse.redirect(new URL("/sign-in", req.url));
	response.cookies.set("cfl_session", "", {
		path: "/",
		expires: new Date(0),
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	return response;
}
