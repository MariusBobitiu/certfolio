import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { and, asc, eq } from 'drizzle-orm'

import { getCurrentSession } from '@/lib/auth/session'
import { db, ProjectEvidenceLinksTable, ProjectsTable } from '@/lib/db/drizzle'
import { getProjectAssetUrl } from '@/lib/storage/r2'

import { ProjectDetailForm } from './project-detail-form'
import { ChevronLeft } from 'lucide-react'

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const session = await getCurrentSession()
	if (!session) {
		redirect('/sign-in')
	}

	const { slug } = await params

	const [project] = await db
		.select()
		.from(ProjectsTable)
		.where(
			and(
				eq(ProjectsTable.user_id, session.user.id),
				eq(ProjectsTable.slug, slug)
			)
		)
		.limit(1)

	if (!project) {
		notFound()
	}

	const evidenceLinks = await db
		.select()
		.from(ProjectEvidenceLinksTable)
		.where(eq(ProjectEvidenceLinksTable.project_id, project.id))
		.orderBy(asc(ProjectEvidenceLinksTable.sort_order))
	const coverImageUrl = project.cover_image_key
		? await getProjectAssetUrl(project.cover_image_key)
		: null

	return (
		<div className='relative space-y-8 overflow-hidden'>
			<div className='absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(3,105,161,0.1),transparent_28%),linear-gradient(180deg,rgba(100,116,139,0.08),transparent_78%)]' />

			<section className='rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/45 px-6 py-7 shadow-lg sm:px-8 sm:py-8 dark:border-white/8 dark:from-background dark:via-card/20 dark:to-card/30 dark:shadow-white/2'>
				<div className='space-y-5'>
					<Link
						href='/projects'
						className='inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
					>
						<ChevronLeft className='mr-1 mt-0.5 h-4 w-4' />
						Back to projects
					</Link>

					<div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
						<div className='max-w-3xl space-y-3'>
							<p className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
								Project Workspace
							</p>
							<h1 className='text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl'>
								{project.title}
							</h1>
							<p className='text-base leading-7 text-muted-foreground sm:text-lg'>
								Refine the project entry now, then extend it later with richer
								storytelling, evidence, and profile-ready presentation.
							</p>
						</div>
					</div>
				</div>
			</section>

			<ProjectDetailForm
				project={{
					slug: project.slug,
					title: project.title,
					coverImageKey: project.cover_image_key,
					coverImageUrl,
					projectType: project.project_type,
					role: project.role,
					summary: project.summary,
					context: project.context,
					outcome: project.outcome,
					tools: project.tools,
					status: project.status,
					evidenceLinks: evidenceLinks.map((evidenceLink) => ({
						id: evidenceLink.id,
						label: evidenceLink.label,
						url: evidenceLink.url,
						kind: evidenceLink.kind,
					})),
				}}
			/>
		</div>
	)
}
