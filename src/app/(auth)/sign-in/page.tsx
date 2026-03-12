import { ShieldCheck } from "lucide-react";

import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
					<ShieldCheck className="size-5" />
				</div>
				<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
				<p className="text-sm text-muted-foreground">
					Sign in to manage your certifications and showcase your progress.
				</p>
			</div>

			<SignInForm />
		</div>
	);
}
