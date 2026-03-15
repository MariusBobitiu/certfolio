'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'

import { ProjectCardPreview } from '@/components/projects/project-card-preview'
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

	const { execute, isPending, result } = useAction(updateProjectAction, {
		onSuccess: ({ data }) => {
			if (data?.failure || !data?.project) {
				setSubmitError(data?.failure ?? "We could not update the project right now.")
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
		},
	})
	const validationErrors = (result.validationErrors as ActionValidationErrors | undefined) ?? {}

	const handleChange = <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
		if (submitError) {
			setSubmitError(null)
		}

		setFormState((current) => ({
			...current,
			[field]: value,
		}))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitError(null)
		execute(formState)
	}

	return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-4xl border border-border/70 bg-card/92 px-6 py-5 shadow-md backdrop-blur sm:px-7 dark:border-white/8 dark:shadow-white/2">
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

        <aside className="rounded-4xl border border-border/70 bg-card/88 p-6 shadow-md space-y-6 sm:p-7 xl:sticky xl:top-24 xl:col-span-2 dark:border-white/8 dark:shadow-white/2">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Live Preview
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              How the project reads right now.
            </p>
          </div>

          <ProjectCardPreview
            eyebrow="Preview"
            title={formState.title || "Untitled project"}
            summary={
              formState.summary ||
              "Add a concise summary so the project reads clearly at a glance."
            }
            projectType={formState.projectType || "Not set"}
            role={formState.role || "Not set"}
            status={formState.status}
            variant="preview"
          />
        </aside>
      </div>
    </form>
  )
}
