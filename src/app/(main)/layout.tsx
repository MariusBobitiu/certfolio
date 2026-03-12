import { Metadata } from 'next'
import React from 'react'
import { redirect } from 'next/navigation'

import { getCurrentSession } from '@/lib/auth/session'

import { EmailVerificationBanner } from './email-verification-banner'
import { Navbar } from '../../components/navbar'

export const metadata: Metadata = {
	title: 'Certfolio - Your Digital Certificate Wallet',
	description: 'Securely store and manage your digital certificates with Certfolio, your trusted digital certificate wallet.',
}

export default async function MainLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const currentSession = await getCurrentSession()

	if (!currentSession) {
		redirect('/sign-in')
	}

	return (
		<>
			<Navbar session={currentSession} />
			<main className='relative min-h-screen pt-20 sm:pt-24 bg-background'>
				{/* Content */}
				<div className='relative px-4 py-8 sm:px-6 sm:py-12 lg:px-8'>
					{/* Email verification banner */}
					{!currentSession.user.email_verified_at ? (
						<div className='mb-6'>
							<EmailVerificationBanner />
						</div>
					) : null}

					{/* Page content */}
					<div className='mx-auto max-w-7xl'>
						{children}
					</div>
				</div>
			</main>
		</>
	)
}
