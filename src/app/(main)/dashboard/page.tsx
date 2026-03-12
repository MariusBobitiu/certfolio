import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

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
			<Button className="mt-6" color="destructive" asChild>
				<Link href="/sign-out">Sign Out</Link>
			</Button>
		</div>
	)
}
