import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
	title: 'Settings | Certfolio',
	description: 'Manage your account settings and preferences on Certfolio.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}]
}

export default function SettingsPage() {
	return (
		<div>
			<h1 className="text-3xl font-bold">Settings</h1>
			<p className="mt-4 text-gray-600">Manage your account settings and preferences here.</p>
			{/* Add settings management content here */}
		</div>
	)
}
