import { Metadata } from 'next'
import { desc, eq, inArray } from 'drizzle-orm'

import { getCurrentSession } from '@/lib/auth/session'
import { db, ProjectEvidenceLinksTable, ProjectsTable } from '@/lib/db/drizzle'

import { ProjectsWorkspace } from './projects-workspace'

export const metadata: Metadata = {
	title: 'Projects - Certfolio',
	description: 'Build a proof-backed project portfolio that reflects your professional identity on Certfolio.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}],
}

const foundationSignals = [
	'Proof-backed professional work',
	'Reusable on your public profile later',
	'Structured for outcomes, context, and evidence',
] as const

export default async function ProjectsPage() {
	const session = await getCurrentSession()
	const projects = session
		? await db
				.select()
				.from(ProjectsTable)
				.where(eq(ProjectsTable.user_id, session.user.id))
				.orderBy(desc(ProjectsTable.created_at))
		: []
	const evidenceLinks =
		projects.length > 0
			? await db
					.select({
						projectId: ProjectEvidenceLinksTable.project_id,
					})
					.from(ProjectEvidenceLinksTable)
					.where(
						inArray(
							ProjectEvidenceLinksTable.project_id,
							projects.map((project) => project.id)
						)
					)
			: []
	const evidenceCountMap = evidenceLinks.reduce<Record<string, number>>((accumulator, link) => {
		accumulator[link.projectId] = (accumulator[link.projectId] ?? 0) + 1
		return accumulator
	}, {})
	const hasProjects = projects.length > 0

	return (
		<div className='relative overflow-hidden'>
			<div className='absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(3,105,161,0.16),transparent_30%),linear-gradient(180deg,rgba(100,116,139,0.1),transparent_78%)]' />

			{hasProjects ? (
				<section className='relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/45 px-6 py-6 shadow-lg sm:px-8 sm:py-7 dark:border-white/8 dark:from-background dark:via-card/20 dark:to-card/30 dark:shadow-white/2'>
					<div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
						<div className='max-w-2xl space-y-3'>
							<div className='inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur'>
								Projects Workspace
							</div>
							<h2 className='text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl'>
								Build a stronger body of proof-backed work.
							</h2>
							<p className='text-sm leading-7 text-muted-foreground sm:text-base'>
								Use this index to shape drafts, revisit published work, and keep your
								project narrative aligned with the professional identity you want
								Certfolio to represent.
							</p>
						</div>

						<div className='flex flex-wrap gap-3 lg:max-w-md lg:justify-end'>
							{foundationSignals.map((signal) => (
								<div
									key={signal}
									className='rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm text-foreground/85 backdrop-blur dark:border-white/8 dark:bg-white/3'
								>
									{signal}
								</div>
							))}
						</div>
					</div>
				</section>
			) : (
				<section className='relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/55 px-6 py-8 shadow-lg sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:border-white/8 dark:from-background dark:via-card/30 dark:to-card/40 dark:shadow-white/2'>
					<div className='max-w-3xl space-y-6'>
						<div className='inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur'>
							Projects Workspace
						</div>

						<div className='space-y-4'>
							<h2 className='max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl'>
								Shape technical work into credible proof-of-work.
							</h2>
							<p className='max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg'>
								Certfolio projects are meant to hold more than a title and a screenshot.
								This workspace is being structured for context, outcomes, evidence, and
								future profile reuse.
							</p>
						</div>

						<div className='flex flex-wrap gap-3'>
							{foundationSignals.map((signal) => (
								<div
									key={signal}
									className='rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm text-foreground/85 backdrop-blur dark:border-white/8 dark:bg-white/3'
								>
									{signal}
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			<ProjectsWorkspace
				initialProjects={projects.map((project) => ({
					id: project.id,
					slug: project.slug,
					title: project.title,
					projectType: project.project_type,
					role: project.role,
					summary: project.summary,
					context: project.context,
					outcome: project.outcome,
					tools: project.tools,
					evidenceCount: evidenceCountMap[project.id] ?? 0,
					status: project.status,
				}))}
			/>
		</div>
	)
}
