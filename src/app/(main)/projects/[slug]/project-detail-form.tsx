'use client'

import { useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomBadge } from '@/components/custom-badge'
import { toast } from 'sonner'

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
			toast.success("Project updated successfully!")
		},
		onError: ({ error }) => {
			setSubmitError(error.serverError ?? "We could not update the project right now.")
			setSuccessMessage(null)
		},
	})
	const validationErrors = (result.validationErrors as ActionValidationErrors | undefined) ?? {}

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
		execute(formState)
	}

	const statusTone =
		formState.status === 'published'
			? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
			: formState.status === 'archived'
				? 'bg-muted text-muted-foreground'
				: 'bg-amber-500/10 text-amber-600 dark:text-amber-300'

	return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-4xl border border-border/70 bg-card/92 px-6 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:px-7 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-2.5 rounded-full ${formState.status === "published" ? "bg-emerald-500" : formState.status === "archived" ? "bg-muted-foreground" : "bg-amber-500"}`}
            />
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select
              value={formState.status}
              onValueChange={(value) =>
                handleChange("status", value as ProjectFormState["status"])
              }
              disabled={isPending}
            >
              <SelectTrigger className="min-w-32">
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Type:</span>
            <span className="text-base font-medium text-foreground">
              {formState.projectType || "Not set"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Role:</span>
            <span className="text-base font-medium text-foreground">
              {formState.role || "Not set"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-5 xl:items-start">
        <div className="px-1 sm:px-2 xl:col-span-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Core Editing
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Edit the core fields
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep this pass focused on the fundamentals that make the project
              legible.
            </p>
          </div>

          <div className="mt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="project-title">Project title</FieldLabel>
                <Input
                  id="project-title"
                  value={formState.title}
                  disabled={isPending}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
                />
                <FieldError
                  errors={[{ message: validationErrors.title?._errors?.[0] }]}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-type">Project type</FieldLabel>
                  <Input
                    id="project-type"
                    value={formState.projectType}
                    disabled={isPending}
                    onChange={(event) =>
                      handleChange("projectType", event.target.value)
                    }
                  />
                  <FieldError
                    errors={[
                      { message: validationErrors.projectType?._errors?.[0] },
                    ]}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="project-role">Your role</FieldLabel>
                  <Input
                    id="project-role"
                    value={formState.role}
                    disabled={isPending}
                    onChange={(event) =>
                      handleChange("role", event.target.value)
                    }
                  />
                  <FieldError
                    errors={[{ message: validationErrors.role?._errors?.[0] }]}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="project-summary">
                  Project summary
                </FieldLabel>
                <Textarea
                  id="project-summary"
                  value={formState.summary}
                  disabled={isPending}
                  onChange={(event) =>
                    handleChange("summary", event.target.value)
                  }
                  className="min-h-40"
                />
                <FieldDescription>
                  Problem, ownership, delivery, and why the project matters.
                </FieldDescription>
                <FieldError
                  errors={[{ message: validationErrors.summary?._errors?.[0] }]}
                />
              </Field>

              <FieldError
                errors={[{ message: validationErrors.status?._errors?.[0] }]}
              />
              <FieldError
                errors={submitError ? [{ message: submitError }] : []}
              />
              {successMessage ? (
                <p className="text-sm text-primary">{successMessage}</p>
              ) : null}

              <div className="flex justify-end border-t border-border/60 pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full"
                >
                  Save changes
                </Button>
              </div>
            </FieldGroup>
          </div>
        </div>

        <aside className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur sm:p-7 xl:sticky xl:top-24 xl:col-span-2 dark:border-white/8 dark:bg-[#17171c] dark:shadow-none">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Live Preview
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              How the project reads right now.
            </p>
          </div>

          <article className="mt-8 flex min-h-64 flex-col rounded-3xl border border-border/70 bg-linear-to-br from-secondary/55 via-card to-card p-5 dark:border-white/7 dark:from-[#121319] dark:via-[#101116] dark:to-[#14161d]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase dark:border-white/8 dark:bg-white/4">
                  Preview
                </div>
                <div
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] capitalize ${statusTone}`}
                >
                  {formState.status}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="line-clamp-2 min-h-12 text-3xl font-semibold tracking-[-0.04em] text-balance text-foreground">
                  {formState.title || "Untitled project"}
                </h3>
                <p className="line-clamp-5 min-h-32 text-sm leading-7 text-muted-foreground">
                  {formState.summary ||
                    "Add a concise summary so the project reads clearly at a glance."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap content-start gap-2">
              {/* <div className="rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm dark:border-white/8 dark:bg-white/4">
                Type: {formState.projectType || "Not set"}
              </div>
              <div className="rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm dark:border-white/8 dark:bg-white/4">
                Role: {formState.role || "Not set"}
              </div> */}
              <CustomBadge
                label="Type"
                value={formState.projectType || "Not set"}
              />
              <CustomBadge label="Role" value={formState.role || "Not set"} />
            </div>

            <div className="mt-auto pt-4">
              <p className="text-sm font-medium text-primary">
                How this card would read to someone else
              </p>
            </div>
          </article>
        </aside>
      </div>
    </form>
  )
}
