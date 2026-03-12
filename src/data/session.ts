"use server";

import { cookies } from "next/headers";

export const getSession = async () => {
	const cookieStore = await cookies();

	const sessionCookie = cookieStore.get("cfl_session");
	if (!sessionCookie) {
		console.warn("Session cookie 'cfl_session' not found.");
		return null;
	}

	// TODO: verify the session cookie with hashed value in the database and return the user session data if valid
	const sessionValue = sessionCookie.value;
	return sessionValue;
};

export const verifySession = async (cookieValue: string): Promise<{
	isValid: boolean;
}> => {
	try {
		// TODO: verify the session cookie with hashed value in the database
		const isValid = cookieValue === "valid_session_cookie_value"; // Replace with actual verification logic
		return { isValid };
	} catch (error) {
		console.error("Error verifying session:", error);
		return { isValid: false };
	}
}
