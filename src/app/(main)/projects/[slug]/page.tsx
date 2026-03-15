import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'

import { getCurrentSession } from '@/lib/auth/session'
import { db, ProjectsTable } from '@/lib/db/drizzle'

import { ProjectDetailForm } from './project-detail-form'

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

	return (
		<div className='space-y-8'>
			<div className='space-y-3'>
				<Link
					href='/projects'
					className='text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
				>
					Back to projects
				</Link>
				<div className='space-y-2'>
					<p className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
						Project
					</p>
					<h1 className='text-4xl font-semibold tracking-[-0.04em] sm:text-5xl'>
						{project.title}
					</h1>
					<p className='max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg'>
						Use this space to refine the project entry before richer fields, evidence,
						and profile reuse are added.
					</p>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-[1.45fr_0.85fr]'>
				<ProjectDetailForm
					project={{
						slug: project.slug,
						title: project.title,
						projectType: project.project_type,
						role: project.role,
						summary: project.summary,
						status: project.status,
					}}
				/>

				<aside className='rounded-4xl border border-border/70 bg-card/90 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
					<div className='space-y-3'>
						<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
							Current Snapshot
						</p>
						<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
							Basic project metadata
						</h2>
						<p className='text-sm leading-6 text-muted-foreground sm:text-base'>
							This panel keeps the current project identity visible while you edit the
							core fields.
						</p>
					</div>

					<div className='mt-6 flex flex-wrap gap-3'>
						<div className='rounded-full border border-border/70 bg-secondary/45 px-4 py-2 text-sm dark:border-white/7 dark:bg-[#101116]'>
							Status: {project.status}
						</div>
						<div className='rounded-full border border-border/70 bg-secondary/45 px-4 py-2 text-sm dark:border-white/7 dark:bg-[#101116]'>
							Type: {project.project_type}
						</div>
						<div className='rounded-full border border-border/70 bg-secondary/45 px-4 py-2 text-sm dark:border-white/7 dark:bg-[#101116]'>
							Role: {project.role}
						</div>
					</div>

					<div className='mt-6 rounded-3xl border border-dashed border-border/70 bg-muted/45 p-5 dark:border-white/10 dark:bg-white/[0.035]'>
						<p className='text-sm font-medium text-foreground'>What still comes later</p>
						<p className='mt-2 text-sm leading-6 text-muted-foreground'>
							Evidence, richer storytelling fields, credential links, and public-profile
							reuse are intentionally deferred until the base route and editing flow are stable.
						</p>
					</div>
				</aside>
			</div>
		</div>
	)
}
