'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { ProjectCardPreview } from '@/components/projects/project-card-preview'
import { Button } from '@/components/ui/button'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { updateProjectAction } from '../action'

type EvidenceKind =
	| 'repository'
	| 'demo'
	| 'documentation'
	| 'write_up'
	| 'case_study'
	| 'other'

type EvidenceLinkFormState = {
	id: string
	label: string
	url: string
	kind: EvidenceKind
}

type ProjectDetailFormProps = {
	project: {
		slug: string
		title: string
		projectType: string
		role: string
		summary: string
		context: string
		outcome: string
		tools: string
		status: 'draft' | 'published' | 'archived'
		evidenceLinks: EvidenceLinkFormState[]
	}
}

type ProjectFormState = ProjectDetailFormProps['project']

type ActionValidationErrors = {
	title?: { _errors?: string[] }
	projectType?: { _errors?: string[] }
	role?: { _errors?: string[] }
	summary?: { _errors?: string[] }
	context?: { _errors?: string[] }
	outcome?: { _errors?: string[] }
	tools?: { _errors?: string[] }
	status?: { _errors?: string[] }
	evidenceLinks?: Array<{
		label?: { _errors?: string[] }
		url?: { _errors?: string[] }
		kind?: { _errors?: string[] }
	}>
}

const EVIDENCE_KIND_OPTIONS: Array<{ value: EvidenceKind; label: string }> = [
	{ value: 'repository', label: 'Repository' },
	{ value: 'demo', label: 'Live demo' },
	{ value: 'documentation', label: 'Documentation' },
	{ value: 'write_up', label: 'Write-up' },
	{ value: 'case_study', label: 'Case study' },
	{ value: 'other', label: 'Other' },
]

function createEmptyEvidenceLink(): EvidenceLinkFormState {
	return {
		id: crypto.randomUUID(),
		label: '',
		url: '',
		kind: 'repository',
	}
}

export function ProjectDetailForm({ project }: ProjectDetailFormProps) {
	const [formState, setFormState] = useState<ProjectFormState>(project)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const { execute, isPending, result } = useAction(updateProjectAction, {
		onSuccess: ({ data }) => {
			if (data?.failure || !data?.project) {
				setSubmitError(data?.failure ?? 'We could not update the project right now.')
				return
			}

			setFormState({
				slug: data.project.slug,
				title: data.project.title,
				projectType: data.project.project_type,
				role: data.project.role,
				summary: data.project.summary,
				context: data.project.context,
				outcome: data.project.outcome,
				tools: data.project.tools,
				status: data.project.status,
				evidenceLinks:
					data.evidenceLinks?.map((evidenceLink) => ({
						id: evidenceLink.id,
						label: evidenceLink.label,
						url: evidenceLink.url,
						kind: evidenceLink.kind,
					})) ?? [],
			})
			setSubmitError(null)
			toast.success('Project updated successfully!')
		},
		onError: ({ error }) => {
			setSubmitError(error.serverError ?? 'We could not update the project right now.')
		},
	})

	const validationErrors = (result.validationErrors as ActionValidationErrors | undefined) ?? {}

	const handleChange = <K extends keyof ProjectFormState>(
		field: K,
		value: ProjectFormState[K]
	) => {
		if (submitError) {
			setSubmitError(null)
		}

		setFormState((current) => ({
			...current,
			[field]: value,
		}))
	}

	const handleEvidenceChange = <
		K extends keyof Omit<EvidenceLinkFormState, 'id'>
	>(
		index: number,
		field: K,
		value: EvidenceLinkFormState[K]
	) => {
		if (submitError) {
			setSubmitError(null)
		}

		setFormState((current) => ({
			...current,
			evidenceLinks: current.evidenceLinks.map((evidenceLink, evidenceIndex) =>
				evidenceIndex === index
					? {
							...evidenceLink,
							[field]: value,
						}
					: evidenceLink
			),
		}))
	}

	const addEvidenceLink = () => {
		setFormState((current) => ({
			...current,
			evidenceLinks: [...current.evidenceLinks, createEmptyEvidenceLink()],
		}))
	}

	const removeEvidenceLink = (index: number) => {
		setFormState((current) => ({
			...current,
			evidenceLinks: current.evidenceLinks.filter(
				(_, evidenceIndex) => evidenceIndex !== index
			),
		}))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitError(null)
		execute({
			...formState,
			evidenceLinks: formState.evidenceLinks.map((evidenceLink) => ({
				label: evidenceLink.label,
				url: evidenceLink.url,
				kind: evidenceLink.kind,
			})),
		})
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6 sm:space-y-8'>
			<div className='rounded-4xl border border-border/70 bg-card/92 px-5 py-4 shadow-md backdrop-blur sm:px-6 dark:border-white/8 dark:shadow-white/2'>
				<div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
					<div className='grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] lg:items-center xl:flex-1'>
						<div className='flex items-center gap-3'>
						<div
							className={`size-2.5 rounded-full ${
								formState.status === 'published'
									? 'bg-emerald-500'
									: formState.status === 'archived'
										? 'bg-muted-foreground'
										: 'bg-amber-500'
							}`}
						/>
							<span className='text-sm text-muted-foreground'>Status</span>
						<Select
							value={formState.status}
							onValueChange={(value) =>
								handleChange('status', value as ProjectFormState['status'])
							}
							disabled={isPending}
						>
							<SelectTrigger className='w-full max-w-40'>
								<SelectValue placeholder='Select project status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='draft'>Draft</SelectItem>
								<SelectItem value='published'>Published</SelectItem>
								<SelectItem value='archived'>Archived</SelectItem>
							</SelectContent>
						</Select>
						</div>

						<div className='flex items-center gap-3'>
							<span className='text-sm text-muted-foreground'>Type</span>
							<span className='text-base font-medium text-foreground'>
								{formState.projectType || 'Not set'}
							</span>
						</div>

						<div className='flex items-center gap-3'>
							<span className='text-sm text-muted-foreground'>Role</span>
							<span className='text-base font-medium text-foreground'>
								{formState.role || 'Not set'}
							</span>
						</div>
					</div>

					<Button
						type='submit'
						disabled={isPending}
						className='rounded-full xl:shrink-0'
					>
						Save changes
					</Button>
				</div>
			</div>

			<FieldError
				errors={[{ message: validationErrors.status?._errors?.[0] }]}
			/>
			<FieldError
				errors={submitError ? [{ message: submitError }] : []}
			/>

			<div className='grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-start'>
				<div className='space-y-8'>
					<div className='space-y-3'>
						<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
							Core Editing
						</p>
						<h2 className='text-2xl font-semibold tracking-[-0.03em] sm:text-3xl'>
							Edit the core fields
						</h2>
						<p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
							Tighten the essentials first, then add the context, outcome, and
							supporting links that make the work credible.
						</p>
					</div>

					<FieldGroup>
						<div className='space-y-5'>
							<div className='space-y-2'>
								<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
									Identity
								</p>
								<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
									Keep the project legible at a glance: what it is, what you
									owned, and how it should read in a list.
								</p>
							</div>

							<Field>
								<FieldLabel htmlFor='project-title'>Project title</FieldLabel>
								<Input
									id='project-title'
									value={formState.title}
									disabled={isPending}
									onChange={(event) => handleChange('title', event.target.value)}
								/>
								<FieldError
									errors={[{ message: validationErrors.title?._errors?.[0] }]}
								/>
							</Field>

							<div className='grid gap-4 sm:grid-cols-2'>
								<Field>
									<FieldLabel htmlFor='project-type'>Project type</FieldLabel>
									<Input
										id='project-type'
										value={formState.projectType}
										disabled={isPending}
										onChange={(event) =>
											handleChange('projectType', event.target.value)
										}
									/>
									<FieldError
										errors={[
											{ message: validationErrors.projectType?._errors?.[0] },
										]}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor='project-role'>Your role</FieldLabel>
									<Input
										id='project-role'
										value={formState.role}
										disabled={isPending}
										onChange={(event) => handleChange('role', event.target.value)}
									/>
									<FieldError
										errors={[{ message: validationErrors.role?._errors?.[0] }]}
									/>
								</Field>
							</div>

							<Field>
								<FieldLabel htmlFor='project-summary'>Project summary</FieldLabel>
								<Textarea
									id='project-summary'
									value={formState.summary}
									disabled={isPending}
									onChange={(event) =>
										handleChange('summary', event.target.value)
									}
									className='min-h-36'
								/>
								<FieldDescription>
									Problem, ownership, delivery, and why the project matters.
								</FieldDescription>
								<FieldError
									errors={[{ message: validationErrors.summary?._errors?.[0] }]}
								/>
							</Field>
						</div>

						<FieldSeparator>Project story</FieldSeparator>

						<div className='space-y-5'>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
								Add the surrounding context and the result so the project reads
								like proof-of-work rather than a bare portfolio tile.
							</p>

							<div className='grid gap-4 xl:grid-cols-2'>
								<Field>
									<FieldLabel htmlFor='project-context'>Project context</FieldLabel>
									<Textarea
										id='project-context'
										value={formState.context}
										disabled={isPending}
										onChange={(event) =>
											handleChange('context', event.target.value)
										}
										className='min-h-32'
									/>
									<FieldDescription>
										What situation, problem, or environment led to this work?
									</FieldDescription>
									<FieldError
										errors={[{ message: validationErrors.context?._errors?.[0] }]}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor='project-outcome'>Outcome / impact</FieldLabel>
									<Textarea
										id='project-outcome'
										value={formState.outcome}
										disabled={isPending}
										onChange={(event) =>
											handleChange('outcome', event.target.value)
										}
										className='min-h-32'
									/>
									<FieldDescription>
										What changed, improved, or was delivered because of the project?
									</FieldDescription>
									<FieldError
										errors={[{ message: validationErrors.outcome?._errors?.[0] }]}
									/>
								</Field>
							</div>

							<Field>
								<FieldLabel htmlFor='project-tools'>Tools / stack</FieldLabel>
								<Input
									id='project-tools'
									value={formState.tools}
									disabled={isPending}
									onChange={(event) => handleChange('tools', event.target.value)}
									placeholder='Terraform, Docker, PostgreSQL'
								/>
								<FieldDescription>
									Use a simple comma-separated list for now.
								</FieldDescription>
								<FieldError
									errors={[{ message: validationErrors.tools?._errors?.[0] }]}
								/>
							</Field>
						</div>
					</FieldGroup>
				</div>

				<aside className='space-y-6 xl:sticky xl:top-28'>
					<div className='rounded-4xl border border-border/70 bg-card/88 p-6 shadow-md sm:p-7 dark:border-white/8 dark:shadow-white/2'>
						<div className='space-y-2'>
							<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
								Live Preview
							</p>
							<p className='text-sm leading-6 text-muted-foreground'>
								How the project reads right now.
							</p>
						</div>

						<div className='mt-5'>
							<ProjectCardPreview
								eyebrow='Preview'
								title={formState.title || 'Untitled project'}
								summary={
									formState.summary ||
									'Add a concise summary so the project reads clearly at a glance.'
								}
								projectType={formState.projectType || 'Not set'}
								role={formState.role || 'Not set'}
								status={formState.status}
								variant='preview'
							/>
						</div>
					</div>

					<div className='rounded-4xl border border-border/70 bg-card/88 p-6 shadow-md sm:p-7 dark:border-white/8 dark:shadow-white/2'>
						<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
							<div className='space-y-2'>
								<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
									Supporting evidence
								</p>
								<p className='text-sm leading-6 text-muted-foreground'>
									Links that support the work: repositories, demos, write-ups, and
									other proof points.
								</p>
							</div>

							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={addEvidenceLink}
								className='rounded-full sm:self-start'
							>
								<Plus className='size-4' />
								Add evidence
							</Button>
						</div>

						<div className='mt-5 space-y-3'>
							{formState.evidenceLinks.length === 0 ? (
								<div className='rounded-3xl border border-dashed border-border/70 bg-card/40 px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-white/8'>
									No evidence links yet. Add the strongest public proof you can
									share for this project.
								</div>
							) : (
								formState.evidenceLinks.map((evidenceLink, index) => (
									<div
										key={evidenceLink.id}
										className='rounded-3xl border border-border/60 bg-card/40 p-4 dark:border-white/8'
									>
										<div className='flex items-center justify-between gap-3'>
											<p className='text-sm font-medium text-foreground'>
												Evidence {index + 1}
											</p>
											<Button
												type='button'
												variant='ghost'
												size='icon-sm'
												onClick={() => removeEvidenceLink(index)}
												aria-label={`Remove evidence link ${index + 1}`}
											>
												<Trash2 className='size-4' />
											</Button>
										</div>

										<div className='mt-4 space-y-4'>
											<div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]'>
												<Field>
													<FieldLabel htmlFor={`evidence-label-${index}`}>
														Label
													</FieldLabel>
													<Input
														id={`evidence-label-${index}`}
														value={evidenceLink.label}
														disabled={isPending}
														onChange={(event) =>
															handleEvidenceChange(index, 'label', event.target.value)
														}
														placeholder='GitHub repository'
													/>
													<FieldError
														errors={[
															{
																message:
																	validationErrors.evidenceLinks?.[index]?.label?._errors?.[0],
															},
														]}
													/>
												</Field>

												<Field>
													<FieldLabel htmlFor={`evidence-kind-${index}`}>
														Type
													</FieldLabel>
													<Select
														value={evidenceLink.kind}
														onValueChange={(value) =>
															handleEvidenceChange(
																index,
																'kind',
																value as EvidenceKind
															)
														}
														disabled={isPending}
													>
														<SelectTrigger id={`evidence-kind-${index}`}>
															<SelectValue placeholder='Select evidence type' />
														</SelectTrigger>
														<SelectContent>
															{EVIDENCE_KIND_OPTIONS.map((option) => (
																<SelectItem key={option.value} value={option.value}>
																	{option.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FieldError
														errors={[
															{
																message:
																	validationErrors.evidenceLinks?.[index]?.kind?._errors?.[0],
															},
														]}
													/>
												</Field>
											</div>

											<Field>
												<FieldLabel htmlFor={`evidence-url-${index}`}>URL</FieldLabel>
												<Input
													id={`evidence-url-${index}`}
													type='url'
													value={evidenceLink.url}
													disabled={isPending}
													onChange={(event) =>
														handleEvidenceChange(index, 'url', event.target.value)
													}
													placeholder='https://github.com/...'
												/>
												<FieldError
													errors={[
														{
															message:
																validationErrors.evidenceLinks?.[index]?.url?._errors?.[0],
														},
													]}
												/>
											</Field>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</aside>
			</div>
		</form>
	)
}
