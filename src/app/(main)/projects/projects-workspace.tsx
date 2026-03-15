'use client'

import { useEffect, useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { Plus, Sparkles } from 'lucide-react'

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

export function ProjectsWorkspace({ initialProjects }: ProjectsWorkspaceProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [draft, setDraft] = useState<ProjectDraft>(emptyDraft)
	const [projects, setProjects] = useState<ProjectDraft[]>(initialProjects)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [validationErrors, setValidationErrors] = useState<ActionValidationErrors>({})

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
			setValidationErrors({})
			setIsDialogOpen(false)
		},
		onError: ({ error }) => {
			setSubmitError(error.serverError ?? "We could not create the project right now.")
		},
	})

	useEffect(() => {
		const errors = result.validationErrors as ActionValidationErrors | undefined
		if (!errors) {
			return
		}

		setValidationErrors(errors)
	}, [result.validationErrors])

	const handleChange = (field: keyof ProjectDraft, value: string) => {
		if (submitError) {
			setSubmitError(null)
		}

		if (validationErrors[field as keyof ActionValidationErrors]) {
			setValidationErrors((current) => ({
				...current,
				[field]: undefined,
			}))
		}

		setDraft((current) => ({
			...current,
			[field]: value,
		}))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitError(null)
		setValidationErrors({})
		execute({
			title: draft.title,
			projectType: draft.projectType,
			role: draft.role,
			summary: draft.summary,
		})
	}

	return (
		<>
			<section className='mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]'>
				<div className='rounded-4xl border border-border/70 bg-card/92 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
					<div className='space-y-3 border-b border-border/60 pb-5'>
						<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
							Collection Surface
						</p>
						<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
							{projects.length > 0
								? 'Projects created in this session'
								: 'No projects yet, but the first one should set the tone'}
						</h2>
						<p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
							{projects.length > 0
								? 'These cards are local session previews only. They establish the listing surface and information hierarchy before persistence and editing arrive in later phases.'
								: 'A strong Certfolio project explains context, ownership, outcome, and how the work can be trusted. Start with one project you can describe clearly, then deepen it over time.'}
						</p>
					</div>

					<div className='mt-6 space-y-5'>
						{projects.length > 0 ? (
							<div className='grid gap-4 xl:grid-cols-2'>
								{projects.map((project, index) => (
									<article
										key={project.id}
										className='rounded-3xl border border-border/70 bg-secondary/45 p-5 dark:border-white/7 dark:bg-[#101116]'
									>
										<div className='space-y-3'>
											<div className='inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:border-white/8 dark:bg-white/4'>
												<Sparkles className='size-3.5' />
												{index === 0 ? 'Newest draft' : 'Draft preview'}
											</div>
											<div>
												<h3 className='text-xl font-semibold tracking-[-0.03em] text-foreground'>
													{project.title}
												</h3>
												<p className='mt-2 text-sm leading-6 text-muted-foreground'>
													{project.summary}
												</p>
											</div>
										</div>

										<div className='mt-5 flex flex-wrap gap-3'>
											<div className='rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm dark:border-white/8 dark:bg-white/4'>
												Type: {project.projectType}
											</div>
											<div className='rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm dark:border-white/8 dark:bg-white/4'>
												Role: {project.role}
											</div>
											<div className='rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm capitalize dark:border-white/8 dark:bg-white/4'>
												Status: {project.status}
											</div>
										</div>
									</article>
								))}
							</div>
						) : (
							<>
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
							</>
						)}
					</div>
				</div>

				<aside className='rounded-4xl border border-border/70 bg-card/90 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
					<div className='space-y-3'>
						<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
							Editorial Direction
						</p>
						<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
							Premium, calm, and credibility-first
						</h2>
						<p className='text-sm leading-6 text-muted-foreground sm:text-base'>
							The Projects page is being framed as a professional identity surface, not
							an admin dashboard. Later phases can add actions and data without changing
							this page’s visual hierarchy.
						</p>
					</div>

					<div className='mt-6 space-y-4'>
						<div className='rounded-3xl border border-border/70 bg-secondary/45 p-5 dark:border-white/7 dark:bg-[#101116]'>
							<p className='text-sm font-medium text-foreground'>What this phase establishes</p>
							<p className='mt-2 text-sm leading-6 text-muted-foreground'>
								A lightweight project listing surface with reusable cards that can
								display multiple locally created projects before real persistence exists.
							</p>
						</div>

						<div className='rounded-3xl border border-dashed border-border/70 bg-muted/45 p-5 dark:border-white/10 dark:bg-white/[0.035]'>
							<p className='text-sm font-medium text-foreground'>Intentionally deferred</p>
							<p className='mt-2 text-sm leading-6 text-muted-foreground'>
								Real persistence, multi-project listing behavior, editing history, and
								structured evidence still remain out of scope for this phase.
							</p>
						</div>
					</div>
				</aside>
			</section>

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
