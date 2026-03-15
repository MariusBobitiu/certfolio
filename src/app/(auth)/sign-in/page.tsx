import { ShieldCheck } from "lucide-react";

import { SignInForm } from "./sign-in-form";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSessionToken } from "@/lib/auth/session-core";
import { redirect } from "next/navigation";

export default async function SignInPage() {
	const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);

	if (sessionCookie?.value) {
		const session = await validateSessionToken(sessionCookie.value);

		if (session) {
			// If the user is already authenticated, you can choose to redirect them to the dashboard

			return redirect('/dashboard')
		};
	};
	// Otherwise, render the sign-in page

	return (
		<div className="space-y-5 sm:space-y-6">
			<div className="space-y-2 text-center">
				<div className="mx-auto flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-10">
					<ShieldCheck className="size-5" />
				</div>
				<h1 className="text-[1.85rem] font-semibold tracking-tight sm:text-2xl">Welcome back</h1>
				<p className="text-sm text-muted-foreground">
					Sign in to manage your certifications and showcase your progress.
				</p>
			</div>

			<SignInForm />
		</div>
	);
}
