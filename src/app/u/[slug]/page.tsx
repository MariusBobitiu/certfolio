import { getUserBySlug } from '@/data/user'
import Image from 'next/image';
import React from 'react'

interface UserPageProps {
	params: Promise<{ slug: string }>
}
export default async function page({
	params
}: UserPageProps) {
	const { slug } = await params

	const user = await getUserBySlug(slug);

	if (!user) {
		return (
			<div>
				User not found
			</div>
		)
	}

	return (
		<div>
			<h1>{user.name}</h1>
			<p>{user.email}</p>
			<Image unoptimized src={user.image} alt={user.name} width={100} height={100} />
			 {/* Render other user details as needed */}
		</div>
	)
}
