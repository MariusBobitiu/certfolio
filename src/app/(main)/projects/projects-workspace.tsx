'use client'

import { useState } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { ArrowUpRight, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Field,
	FieldError,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createProjectAction } from './action'

const editorialPrompts = [
	'What problem did this project solve?',
	'What did you specifically own or deliver?',
	'What evidence would make this work more credible later?',
] as const

type ProjectDraft = {
	id: string
	slug: string
	title: string
	projectType: string
	role: string
	summary: string
	status: 'draft' | 'published' | 'archived'
}

const emptyDraft: ProjectDraft = {
	id: '',
	slug: '',
	title: '',
	projectType: '',
	role: '',
	summary: '',
	status: 'draft',
}

type ProjectsWorkspaceProps = {
	initialProjects: ProjectDraft[]
}

type ActionValidationErrors = {
	title?: { _errors?: string[] }
	projectType?: { _errors?: string[] }
	role?: { _errors?: string[] }
	summary?: { _errors?: string[] }
}

function ProjectMetaBadge({
	label,
	value,
	className,
}: {
	label: string
	value: string
	className?: string
}) {
	return (
		<div
			className={cn(
				'relative pt-2',
				className,
			)}
		>
			<span className='absolute left-3 top-1.25 z-10 px-1 text-[6px] font-semibold uppercase tracking-[0.18em] text-muted-foreground bg-card/88 border-t border-border/70 dark:border-white/8 rounded-full'>
				{label}
			</span>
			<span className='inline-flex h-10 w-full items-center rounded-full border border-border/70 bg-card/88 px-6 text-sm text-foreground dark:border-white/8'>
				{value}
			</span>
		</div>
	)
}

export function ProjectsWorkspace({ initialProjects }: ProjectsWorkspaceProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [draft, setDraft] = useState<ProjectDraft>(emptyDraft)
	const [projects, setProjects] = useState<ProjectDraft[]>(initialProjects)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const { execute, isPending, result } = useAction(createProjectAction, {
		onSuccess: ({ data }) => {
			if (data?.failure || !data?.project) {
				setSubmitError(data?.failure ?? "We could not create the project right now.")
				return
			}

			setProjects((current) => [
				{
					id: data.project.id,
					slug: data.project.slug,
					title: data.project.title,
					projectType: data.project.project_type,
					role: data.project.role,
					summary: data.project.summary,
					status: data.project.status,
				},
				...current,
			])
			setDraft(emptyDraft)
			setSubmitError(null)
			setIsDialogOpen(false)
		},
		onError: ({ error }) => {
			setSubmitError(error.serverError ?? "We could not create the project right now.")
		},
	})
	const validationErrors = (result.validationErrors as ActionValidationErrors | undefined) ?? {}

	const handleChange = (field: keyof ProjectDraft, value: string) => {
		if (submitError) {
			setSubmitError(null)
		}

		setDraft((current) => ({
			...current,
			[field]: value,
		}))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitError(null)
		execute({
			title: draft.title,
			projectType: draft.projectType,
			role: draft.role,
			summary: draft.summary,
		})
	}

	const getProjectHref = (slug: string) => `/projects/${slug}` as Route
	const publishedCount = projects.filter((project) => project.status === 'published').length
	const draftCount = projects.filter((project) => project.status === 'draft').length
	const archivedCount = projects.filter((project) => project.status === 'archived').length
	const hasProjects = projects.length > 0

	return (
		<>
			{hasProjects ? (
				<section className='mt-8 space-y-6'>
					<div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
						<div className='space-y-3'>
							<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
								Project Index
							</p>
							<h2 className='text-2xl font-semibold tracking-[-0.03em] sm:text-3xl'>
								Your projects should feel navigable, not buried.
							</h2>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
								Keep the collection readable at a glance, then use each project page to
								develop the fuller proof-of-work story.
							</p>
						</div>

						<Button className='rounded-full lg:shrink-0' onClick={() => setIsDialogOpen(true)}>
							<Plus className='size-4' />
							Add new project
						</Button>
					</div>

					<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
						<div className='rounded-3xl border border-border/70 bg-card/92 px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
							<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
								Total
							</p>
							<p className='mt-2 text-3xl font-semibold tracking-[-0.04em]'>{projects.length}</p>
						</div>
						<div className='rounded-3xl border border-border/70 bg-card/92 px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
							<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
								Published
							</p>
							<p className='mt-2 text-3xl font-semibold tracking-[-0.04em]'>{publishedCount}</p>
						</div>
						<div className='rounded-3xl border border-border/70 bg-card/92 px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
							<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
								Drafts
							</p>
							<p className='mt-2 text-3xl font-semibold tracking-[-0.04em]'>{draftCount}</p>
						</div>
						<div className='rounded-3xl border border-border/70 bg-card/92 px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
							<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
								Archived
							</p>
							<p className='mt-2 text-3xl font-semibold tracking-[-0.04em]'>{archivedCount}</p>
						</div>
					</div>

					<div className='rounded-4xl border border-border/70 bg-card/92 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
						<div className='flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between'>
							<div className='space-y-2'>
								<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
									Collection Surface
								</p>
								<h3 className='text-xl font-semibold tracking-[-0.03em] sm:text-2xl'>
									All projects
								</h3>
								<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
									Drafts, published work, and archived entries all live here until
									you decide how each project should evolve.
								</p>
							</div>
						</div>

						<div className='mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3'>
								{projects.map((project, index) => (
									<article
										key={project.id}
										className='group flex h-full min-h-112 flex-col rounded-3xl border border-border/70 bg-linear-to-br from-secondary/55 via-card to-card p-5 transition-colors hover:border-border/90 dark:border-white/7 dark:from-[#121319] dark:via-[#101116] dark:to-[#14161d]'
									>
										<div className='space-y-4'>
											<div className='flex items-center justify-between gap-3'>
												<div className='inline-flex items-center rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:border-white/8 dark:bg-white/4'>
													{index === 0 ? 'Most recent' : 'Project'}
												</div>
												<div
													className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
														project.status === 'published'
															? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
															: project.status === 'archived'
																? 'bg-muted text-muted-foreground'
																: 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
													}`}
												>
													{project.status}
												</div>
											</div>
											<div className='space-y-3'>
												<Link
													href={getProjectHref(project.slug)}
													className='line-clamp-2 min-h-18 text-2xl font-semibold tracking-[-0.04em] text-foreground transition-opacity hover:opacity-80'
												>
													{project.title}
												</Link>
												<p className='min-h-46 text-sm leading-7 text-muted-foreground line-clamp-4'>
													{project.summary}
												</p>
											</div>
										</div>

										<div className='mt-6 flex min-h-23 flex-wrap content-start gap-2'>
											<ProjectMetaBadge label='Type' value={project.projectType} />
											<ProjectMetaBadge label='Role' value={project.role} />
										</div>

										<div className='mt-auto pt-8'>
											<Link
												href={getProjectHref(project.slug)}
												className='inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline'
											>
												Open project
												<ArrowUpRight className='size-4' />
											</Link>
										</div>
									</article>
								))}
						</div>
					</div>
				</section>
			) : (
				<section className='mt-8 grid gap-6 lg:grid-cols-[1.7fr_0.8fr]'>
					<div className='rounded-4xl border border-border/70 bg-card/92 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
						<div className='space-y-5 border-b border-border/60 pb-5'>
							<div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
								<div className='space-y-3'>
									<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
										Collection Surface
									</p>
									<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
										No projects yet, but the first one should set the tone
									</h2>
									<p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
										A strong Certfolio project explains context, ownership, outcome, and how the work can be trusted. Start with one project you can describe clearly, then deepen it over time.
									</p>
								</div>

								<Button className='rounded-full lg:shrink-0' onClick={() => setIsDialogOpen(true)}>
									<Plus className='size-4' />
									Add new project
								</Button>
							</div>
						</div>

						<div className='mt-6 space-y-5'>
							<div className='rounded-3xl border border-border/70 bg-secondary/45 p-5 dark:border-white/7 dark:bg-[#101116]'>
								<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
									Editorial Guidance
								</p>
								<div className='mt-4 space-y-3'>
									{editorialPrompts.map((prompt, index) => (
										<div key={prompt} className='flex gap-4'>
											<div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-sm font-medium text-foreground dark:bg-white/6'>
												{index + 1}
											</div>
											<p className='pt-1 text-sm leading-6 text-muted-foreground sm:text-base'>
												{prompt}
											</p>
										</div>
									))}
								</div>
							</div>

							<div className='flex flex-col gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/45 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.035]'>
								<div>
									<p className='text-sm font-medium text-foreground'>Start with a project that can carry your story</p>
									<p className='mt-1 text-sm leading-6 text-muted-foreground'>
										Choose work you can explain well now and support with stronger proof later.
									</p>
								</div>
								<Button className='rounded-full sm:self-start' onClick={() => setIsDialogOpen(true)}>
									<Plus className='size-4' />
									Add new project
								</Button>
							</div>
						</div>
					</div>

					<aside className='rounded-4xl border border-border/70 bg-card/90 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
						<div className='space-y-3'>
							<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
								Workspace Notes
							</p>
							<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
								Projects should read like evidence, not inventory
							</h2>
							<p className='text-sm leading-6 text-muted-foreground sm:text-base'>
								Each project should eventually communicate context, ownership, outcomes,
								and supporting proof in a recruiter-friendly way.
							</p>
						</div>

						<div className='mt-6 space-y-4'>
							<div className='rounded-3xl border border-border/70 bg-secondary/45 p-5 dark:border-white/7 dark:bg-[#101116]'>
								<p className='text-sm font-medium text-foreground'>What to strengthen next</p>
								<p className='mt-2 text-sm leading-6 text-muted-foreground'>
									Add clearer outcomes, better evidence, and stronger project-specific
									storytelling so each card feels like proof-of-work rather than a summary block.
								</p>
							</div>

							<div className='rounded-3xl border border-dashed border-border/70 bg-muted/45 p-5 dark:border-white/10 dark:bg-white/[0.035]'>
								<p className='text-sm font-medium text-foreground'>Coming later</p>
								<p className='mt-2 text-sm leading-6 text-muted-foreground'>
									Evidence links, richer project fields, public profile reuse, and a more
									robust filtering system still remain out of scope for this phase.
								</p>
							</div>
						</div>
					</aside>
				</section>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl'>
					<form onSubmit={handleSubmit}>
						<DialogHeader className='border-b border-border/60 px-6 pb-5 pt-6 sm:px-7'>
							<DialogTitle className='text-2xl font-semibold tracking-[-0.03em]'>
								Add new project
							</DialogTitle>
							<DialogDescription className='max-w-xl leading-6'>
								Start with the essentials. This first flow captures enough context to
								begin shaping a credible project entry without forcing a full case study yet.
							</DialogDescription>
						</DialogHeader>

						<div className='px-6 py-6 sm:px-7'>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor='project-title'>Project title</FieldLabel>
									<Input
										id='project-title'
										value={draft.title}
										disabled={isPending}
										onChange={(event) => handleChange('title', event.target.value)}
										placeholder='Internal tooling rollout for support operations'
										required
									/>
									<FieldError errors={[{ message: validationErrors.title?._errors?.[0] }]} />
								</Field>

								<div className='grid gap-4 sm:grid-cols-2'>
									<Field>
										<FieldLabel htmlFor='project-type'>Project type</FieldLabel>
										<Input
											id='project-type'
											value={draft.projectType}
											disabled={isPending}
											onChange={(event) => handleChange('projectType', event.target.value)}
											placeholder='Automation, infrastructure, software, security'
											required
										/>
										<FieldError errors={[{ message: validationErrors.projectType?._errors?.[0] }]} />
									</Field>

									<Field>
										<FieldLabel htmlFor='project-role'>Your role</FieldLabel>
										<Input
											id='project-role'
											value={draft.role}
											disabled={isPending}
											onChange={(event) => handleChange('role', event.target.value)}
											placeholder='Engineer, student, consultant, team lead'
											required
										/>
										<FieldError errors={[{ message: validationErrors.role?._errors?.[0] }]} />
									</Field>
								</div>

								<Field>
									<FieldLabel htmlFor='project-summary'>Project summary</FieldLabel>
									<Textarea
										id='project-summary'
										value={draft.summary}
										disabled={isPending}
										onChange={(event) => handleChange('summary', event.target.value)}
										placeholder='Describe the problem, what you delivered, and why the project matters.'
										className='min-h-32'
										required
									/>
									<FieldError errors={[{ message: validationErrors.summary?._errors?.[0] }]} />
									<FieldDescription>
										Focus on context and outcome first. Evidence, links, and richer structure
										will come in later phases.
									</FieldDescription>
								</Field>

								<FieldError errors={submitError ? [{ message: submitError }] : []} />
							</FieldGroup>
						</div>

						<DialogFooter className='border-t border-border/60 px-6 py-5 sm:px-7'>
							<Button type='button' variant='ghost' onClick={() => setIsDialogOpen(false)} disabled={isPending}>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending}>
								Create draft project
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	)
}
