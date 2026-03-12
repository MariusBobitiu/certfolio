import { Spinner } from '@/components/ui/spinner'

export default function SignOutProcessing() {
	return (
		<div className="flex items-center justify-center">
			<Spinner />
			<span className="ml-2 text-sm text-muted-foreground">Signing out...</span>
		</div>
	)
}
