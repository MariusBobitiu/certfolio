import { Metadata } from 'next'

import { ProjectsPageContent } from './projects-page-content'

export const metadata: Metadata = {
	title: 'Projects - Certfolio',
	description: 'Build a proof-backed project portfolio that reflects your professional identity on Certfolio.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}],
}

export default function ProjectsPage() {
	return <ProjectsPageContent />
}
