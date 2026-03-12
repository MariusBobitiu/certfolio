import Link from "next/link"
import { CheckCircle2, CircleAlert, MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { verifyEmailToken } from "@/lib/auth/email-verification"

type VerifyEmailPageProps = {
	searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
	const { token } = await searchParams

	if (token) {
		const result = await verifyEmailToken(token)

		if (result.success) {
			return (
				<div className="space-y-6 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
						<CheckCircle2 className="size-6" />
					</div>

					<div className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
						<p className="text-sm text-muted-foreground">
							Your account is now verified and ready to use.
						</p>
					</div>

					<Button asChild className="w-full">
						<Link href="/dashboard">Continue to dashboard</Link>
					</Button>
				</div>
			)
		}

		return (
			<div className="space-y-6 text-center">
				<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
					<CircleAlert className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">Verification link expired</h1>
					<p className="text-sm text-muted-foreground">
						This verification link is invalid or has already been used. Sign in and request a new one.
					</p>
				</div>

				<Button asChild className="w-full">
					<Link href="/sign-in">Go to sign in</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-6 text-center">
			<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<MailCheck className="size-6" />
			</div>

			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
				<p className="text-sm text-muted-foreground">
					We sent a verification link to your email. Open it to verify your account.
				</p>
			</div>

			<Button asChild variant="outline" className="w-full">
				<Link href="/sign-in">Back to sign in</Link>
			</Button>
		</div>
	)
}
