import Link from "next/link"
import { CheckCircle2, CircleAlert, MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	clearPendingEmailVerificationCookie,
	getPendingEmailVerificationCookie,
	verifyEmailToken,
} from "@/lib/auth/email-verification"

import { ResendVerificationForm } from "./resend-verification-form"

type VerifyEmailPageProps = {
	searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
	const { token } = await searchParams
	const pendingVerification = await getPendingEmailVerificationCookie()

	if (token) {
		const result = await verifyEmailToken(token)

		if (result.success) {
			await clearPendingEmailVerificationCookie()

			return (
				<div className="space-y-6 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
						<CheckCircle2 className="size-6" />
					</div>

					<div className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
						<p className="text-sm text-muted-foreground">
							Your account is now verified. Sign in to continue.
						</p>
					</div>

					<Button asChild className="w-full">
						<Link href="/sign-in">Continue to sign in</Link>
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
		<div className="space-y-5">
			<div className="space-y-3 text-center">
				<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<MailCheck className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
					<p className="text-sm text-muted-foreground">
						Open the link we emailed you to continue. If it hasn&apos;t arrived,
						enter your address below and we&apos;ll send another.
					</p>
				</div>
			</div>

			<div className="space-y-3">
				{pendingVerification ? (
					<p className="text-center text-sm text-muted-foreground">
						Sent to{" "}
						<span className="font-medium text-foreground">
							{pendingVerification.maskedEmail}
						</span>
					</p>
				) : null}
				<ResendVerificationForm />
			</div>

			<Button asChild variant="outline" className="w-full">
				<Link href="/sign-in">Back to sign in</Link>
			</Button>
		</div>
	)
}
