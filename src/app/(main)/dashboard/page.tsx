import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Dashboard | Certfolio',
	description: 'Your personal dashboard on Certfolio. Manage your certificates, view your profile information, and access your account settings all in one place.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}]
}

export default function DashboardPage() {
	return (
		<div>
			<h1 className="text-3xl font-bold">Dashboard</h1>
			<p className="mt-4 text-gray-600">Welcome to your dashboard! Here you can manage your certificates and view your profile information.</p>
			{/* Add more dashboard content here */}
			<div className="mt-6">
				<form action="/api/sign-out" method="POST">
					<Button type="submit" variant="destructive">
						Sign out
					</Button>
				</form>
			</div>
		</div>
	)
}
