import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
	title: 'Certfolio - Your Digital Certificate Wallet',
	description: 'Securely store and manage your digital certificates with Certfolio, your trusted digital certificate wallet.',
}

export default async function MainLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<main
			className='relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-zinc-50 via-sky-50 to-blue-100 px-4 py-10 dark:from-zinc-950 dark:via-zinc-900 dark:to-[rgba(0,90,138,0.12)]'
		>
			<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,90,138,0.12),transparent_45%)]' />
			<div className='relative w-full max-w-3xl rounded-2xl border border-border/70 bg-card/95 p-7 shadow-xl backdrop-blur sm:p-8'>
				{children}
			</div>
		</main>
	)
}
