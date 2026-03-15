import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
	title: 'Profile - Certfolio',
	description: 'Manage your profile information and settings on Certfolio.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}]
}

export default function ProfilePage() {
	return (
		<div>
			<h1 className="text-3xl font-bold">Profile</h1>
			<p className="mt-4 text-gray-600">Manage your account information and settings here.</p>
			{/* Add account management content here */}
		</div>
	)
}
