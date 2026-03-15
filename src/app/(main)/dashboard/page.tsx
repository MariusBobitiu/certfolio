import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Dashboard - Certfolio',
	description: 'Your personal dashboard on Certfolio. Manage your certificates, view your profile information, and access your account settings all in one place.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}]
}

export default function DashboardPage() {
	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-4xl font-bold tracking-tight'>Dashboard</h1>
				<p className='mt-3 text-lg text-muted-foreground'>Welcome to your certificate wallet. Manage all your digital credentials in one place.</p>
			</div>

			{/* Placeholder grid for certificates */}
			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{[...Array(3)].map((_, i) => (
					<div key={i} className='rounded-lg border border-border/50 bg-card p-6 backdrop-blur hover:border-border transition-colors'>
						<div className='h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-md mb-4' />
						<h3 className='font-semibold text-sm'>Certificate {i + 1}</h3>
						<p className='text-xs text-muted-foreground mt-1'>Add your certificates here</p>
					</div>
				))}
			</div>
		</div>
	)
}
