'use client'

import { useEffect, useState } from 'react'
import { useAction } from 'next-safe-action/hooks'

import { Button } from '@/components/ui/button'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateProjectAction } from '../action'

type ProjectDetailFormProps = {
	project: {
		slug: string
		title: string
		projectType: string
		role: string
		summary: string
		status: 'draft' | 'published' | 'archived'
	}
}

type ProjectFormState = ProjectDetailFormProps['project']

type ActionValidationErrors = {
	title?: { _errors?: string[] }
	projectType?: { _errors?: string[] }
	role?: { _errors?: string[] }
	summary?: { _errors?: string[] }
	status?: { _errors?: string[] }
}

export function ProjectDetailForm({ project }: ProjectDetailFormProps) {
	const [formState, setFormState] = useState<ProjectFormState>(project)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const [validationErrors, setValidationErrors] = useState<ActionValidationErrors>({})

	const { execute, isPending, result } = useAction(updateProjectAction, {
		onSuccess: ({ data }) => {
			if (data?.failure || !data?.project) {
				setSubmitError(data?.failure ?? "We could not update the project right now.")
				setSuccessMessage(null)
				return
			}

			setFormState({
				slug: data.project.slug,
				title: data.project.title,
				projectType: data.project.project_type,
				role: data.project.role,
				summary: data.project.summary,
				status: data.project.status,
			})
			setSubmitError(null)
			setSuccessMessage("Project updated")
			setValidationErrors({})
		},
		onError: ({ error }) => {
			setSubmitError(error.serverError ?? "We could not update the project right now.")
			setSuccessMessage(null)
		},
	})

	useEffect(() => {
		const errors = result.validationErrors as ActionValidationErrors | undefined
		if (!errors) {
			return
		}

		setValidationErrors(errors)
	}, [result.validationErrors])

	const handleChange = <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
		if (submitError) {
			setSubmitError(null)
		}
		if (successMessage) {
			setSuccessMessage(null)
		}

		setFormState((current) => ({
			...current,
			[field]: value,
		}))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitError(null)
		setSuccessMessage(null)
		setValidationErrors({})
		execute(formState)
	}

	return (
		<form onSubmit={handleSubmit} className='rounded-4xl border border-border/70 bg-card/92 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none'>
			<div className='space-y-3 border-b border-border/60 pb-5'>
				<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
					Project Details
				</p>
				<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
					Refine the draft
				</h2>
				<p className='text-sm leading-6 text-muted-foreground sm:text-base'>
					Update the core fields for this project before richer proof-of-work structure
					and evidence are added in later phases.
				</p>
			</div>

			<div className='mt-6'>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor='project-title'>Project title</FieldLabel>
						<Input
							id='project-title'
							value={formState.title}
							disabled={isPending}
							onChange={(event) => handleChange('title', event.target.value)}
						/>
						<FieldError errors={[{ message: validationErrors.title?._errors?.[0] }]} />
					</Field>

					<div className='grid gap-4 sm:grid-cols-2'>
						<Field>
							<FieldLabel htmlFor='project-type'>Project type</FieldLabel>
							<Input
								id='project-type'
								value={formState.projectType}
								disabled={isPending}
								onChange={(event) => handleChange('projectType', event.target.value)}
							/>
							<FieldError errors={[{ message: validationErrors.projectType?._errors?.[0] }]} />
						</Field>

						<Field>
							<FieldLabel htmlFor='project-role'>Your role</FieldLabel>
							<Input
								id='project-role'
								value={formState.role}
								disabled={isPending}
								onChange={(event) => handleChange('role', event.target.value)}
							/>
							<FieldError errors={[{ message: validationErrors.role?._errors?.[0] }]} />
						</Field>
					</div>

					<Field>
						<FieldLabel htmlFor='project-status'>Status</FieldLabel>
						<select
							id='project-status'
							value={formState.status}
							disabled={isPending}
							onChange={(event) => handleChange('status', event.target.value as ProjectFormState['status'])}
							className='h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30'
						>
							<option value='draft'>Draft</option>
							<option value='published'>Published</option>
							<option value='archived'>Archived</option>
						</select>
						<FieldDescription>
							Use `draft` while iterating, `published` when the project is ready to be
							reused publicly later, and `archived` to remove it from active work.
						</FieldDescription>
						<FieldError errors={[{ message: validationErrors.status?._errors?.[0] }]} />
					</Field>

					<Field>
						<FieldLabel htmlFor='project-summary'>Project summary</FieldLabel>
						<Textarea
							id='project-summary'
							value={formState.summary}
							disabled={isPending}
							onChange={(event) => handleChange('summary', event.target.value)}
							className='min-h-40'
						/>
						<FieldDescription>
							Keep this tight: problem, ownership, delivery, and why the project matters.
						</FieldDescription>
						<FieldError errors={[{ message: validationErrors.summary?._errors?.[0] }]} />
					</Field>

					<FieldError errors={submitError ? [{ message: submitError }] : []} />
					{successMessage ? <p className='text-sm text-primary'>{successMessage}</p> : null}

					<div className='flex justify-end'>
						<Button type='submit' disabled={isPending} className='rounded-full'>
							Save changes
						</Button>
					</div>
				</FieldGroup>
			</div>
		</form>
	)
}
