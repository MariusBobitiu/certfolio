"use client"

import { useState } from "react"
import { ImagePlus, LoaderCircle, Plus, Trash2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { updateProjectAction } from "../action"

type EvidenceKind =
  | "repository"
  | "demo"
  | "documentation"
  | "write_up"
  | "case_study"
  | "other"

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
    coverImageKey: string
    coverImageUrl: string | null
    projectType: string
    role: string
    summary: string
    context: string
    outcome: string
    tools: string
    status: "draft" | "published" | "archived"
    evidenceLinks: EvidenceLinkFormState[]
  }
}

type ProjectFormState = ProjectDetailFormProps["project"]

type ActionValidationErrors = {
  title?: { _errors?: string[] }
  coverImageKey?: { _errors?: string[] }
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
  { value: "repository", label: "Repository" },
  { value: "demo", label: "Live demo" },
  { value: "documentation", label: "Documentation" },
  { value: "write_up", label: "Write-up" },
  { value: "case_study", label: "Case study" },
  { value: "other", label: "Other" },
]

function createEmptyEvidenceLink(): EvidenceLinkFormState {
  return {
    id: crypto.randomUUID(),
    label: "",
    url: "",
    kind: "repository",
  }
}

export function ProjectDetailForm({ project }: ProjectDetailFormProps) {
  const [formState, setFormState] = useState<ProjectFormState>(project)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const { execute, isPending, result } = useAction(updateProjectAction, {
    onSuccess: ({ data }) => {
      if (data?.failure || !data?.project) {
        setSubmitError(
          data?.failure ?? "We could not update the project right now."
        )
        return
      }

      setFormState({
        slug: data.project.slug,
        title: data.project.title,
        coverImageKey: data.project.cover_image_key,
        coverImageUrl: formState.coverImageUrl,
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
      toast.success("Project updated successfully!")
    },
    onError: ({ error }) => {
      setSubmitError(
        error.serverError ?? "We could not update the project right now."
      )
    },
  })

  const validationErrors =
    (result.validationErrors as ActionValidationErrors | undefined) ?? {}

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
    K extends keyof Omit<EvidenceLinkFormState, "id">,
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

  const uploadCoverFile = async (file: File) => {
    if (!file) {
      return
    }

    setCoverUploadError(null)
    setIsUploadingCover(true)

    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("projectSlug", formState.slug)
      if (formState.coverImageKey) {
        formData.set("currentCoverImageKey", formState.coverImageKey)
      }

      const response = await fetch("/api/projects/cover", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as
        | { key: string; url: string }
        | { error: string }

      if (!response.ok || !("key" in data)) {
        setCoverUploadError(
          "error" in data
            ? data.error
            : "We could not upload the cover image right now."
        )
        return
      }

      setFormState((current) => ({
        ...current,
        coverImageKey: data.key,
        coverImageUrl: data.url,
      }))
      toast.success("Cover image uploaded")
    } catch {
      setCoverUploadError("We could not upload the cover image right now.")
    } finally {
      setIsUploadingCover(false)
    }
  }

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    disabled: isUploadingCover || isPending,
    multiple: false,
    noClick: true,
    onDropAccepted: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) {
        return
      }

      void uploadCoverFile(file)
    },
    onDropRejected: () => {
      setCoverUploadError("Only image uploads are supported.")
    },
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="rounded-4xl border border-border/70 bg-card/92 px-5 py-4 shadow-md backdrop-blur sm:px-6 dark:border-white/8 dark:shadow-white/2">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] lg:items-center xl:flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`size-2.5 rounded-full ${
                  formState.status === "published"
                    ? "bg-emerald-500"
                    : formState.status === "archived"
                      ? "bg-muted-foreground"
                      : "bg-amber-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">Status</span>
              <Select
                value={formState.status}
                onValueChange={(value) =>
                  handleChange("status", value as ProjectFormState["status"])
                }
                disabled={isPending}
              >
                <SelectTrigger className="w-full max-w-40">
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
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-base font-medium text-foreground">
                {formState.projectType || "Not set"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-base font-medium text-foreground">
                {formState.role || "Not set"}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="rounded-full xl:shrink-0"
          >
            Save changes
          </Button>
        </div>
      </div>

      <FieldError
        errors={[{ message: validationErrors.status?._errors?.[0] }]}
      />
      <FieldError errors={submitError ? [{ message: submitError }] : []} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-start">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Core Editing
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Edit the core fields
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Tighten the essentials first, then add the context, outcome, and
              supporting links that make the work credible.
            </p>
          </div>

          <FieldGroup>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Identity
                </p>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Keep the project legible at a glance: what it is, what you
                  owned, and how it should read in a list.
                </p>
              </div>

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
                  className="min-h-36"
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

            <div className="space-y-5">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Add the surrounding context and the result so the project reads
                like proof-of-work rather than a bare portfolio tile.
              </p>

              <div className="grid gap-4 xl:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-context">
                    Project context
                  </FieldLabel>
                  <Textarea
                    id="project-context"
                    value={formState.context}
                    disabled={isPending}
                    onChange={(event) =>
                      handleChange("context", event.target.value)
                    }
                    className="min-h-32"
                  />
                  <FieldDescription>
                    What situation, problem, or environment led to this work?
                  </FieldDescription>
                  <FieldError
                    errors={[
                      { message: validationErrors.context?._errors?.[0] },
                    ]}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="project-outcome">
                    Outcome / impact
                  </FieldLabel>
                  <Textarea
                    id="project-outcome"
                    value={formState.outcome}
                    disabled={isPending}
                    onChange={(event) =>
                      handleChange("outcome", event.target.value)
                    }
                    className="min-h-32"
                  />
                  <FieldDescription>
                    What changed, improved, or was delivered because of the
                    project?
                  </FieldDescription>
                  <FieldError
                    errors={[
                      { message: validationErrors.outcome?._errors?.[0] },
                    ]}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="project-tools">Tools / stack</FieldLabel>
                <Input
                  id="project-tools"
                  value={formState.tools}
                  disabled={isPending}
                  onChange={(event) =>
                    handleChange("tools", event.target.value)
                  }
                  placeholder="Terraform, Docker, PostgreSQL"
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

        <aside className="space-y-6 xl:sticky xl:top-28">
          <div className="rounded-4xl border border-border/70 bg-card/88 p-6 shadow-md sm:p-7 dark:border-white/8 dark:shadow-white/2">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Cover image
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Drag an image here or browse to replace the project cover.
              </p>
            </div>

            <div
              {...getRootProps({
                className: `mt-5 overflow-hidden rounded-3xl border transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-card/40 dark:border-white/8"
                }`,
              })}
            >
              <input {...getInputProps({ id: "project-cover" })} />
              <button
                type="button"
                className="block w-full text-left"
                onClick={open}
                disabled={isUploadingCover || isPending}
              >
                {formState.coverImageUrl ? (
                  <div className="space-y-4 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formState.coverImageUrl}
                      alt={`${formState.title || "Project"} cover`}
                      className="aspect-16/10 w-full rounded-[1.25rem] object-cover"
                    />
                    <div className="flex items-center justify-between gap-3 px-2 pb-2">
                      <p className="text-sm leading-6 text-muted-foreground">
                        Drop a new image here or click to replace the current
                        cover.
                      </p>
                      <span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-sm font-medium text-foreground dark:border-white/8 cursor-pointer z-20 hover:bg-background/40 transition-colors duration-300">
                        {isUploadingCover ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <ImagePlus className="size-4" />
                        )}
                        Replace
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full border border-border/70 bg-card dark:border-white/8 dark:bg-white/4">
                      {isUploadingCover ? (
                        <LoaderCircle className="size-5 animate-spin" />
                      ) : (
                        <ImagePlus className="size-5" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-medium text-foreground">
                        Drop cover image here
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Upload a screenshot, mockup, diagram, or other visual
                        that represents the project well.
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-sm font-medium text-foreground dark:border-white/8">
                      Browse files
                    </span>
                  </div>
                )}
              </button>
            </div>

            <FieldError
              errors={[
                { message: validationErrors.coverImageKey?._errors?.[0] },
                ...(coverUploadError ? [{ message: coverUploadError }] : []),
              ]}
            />
          </div>

          <div className="rounded-4xl border border-border/70 bg-card/88 p-6 shadow-md sm:p-7 dark:border-white/8 dark:shadow-white/2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Supporting evidence
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Links that support the work: repositories, demos, write-ups,
                  and other proof points.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEvidenceLink}
                className="rounded-full sm:self-start"
              >
                <Plus className="size-4" />
                Add evidence
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {formState.evidenceLinks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-white/8">
                  No evidence links yet. Add the strongest public proof you can
                  share for this project.
                </div>
              ) : (
                formState.evidenceLinks.map((evidenceLink, index) => (
                  <div
                    key={evidenceLink.id}
                    className="rounded-3xl border border-border/60 bg-card/40 p-4 dark:border-white/8"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Evidence {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEvidenceLink(index)}
                        aria-label={`Remove evidence link ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                        <Field>
                          <FieldLabel htmlFor={`evidence-label-${index}`}>
                            Label
                          </FieldLabel>
                          <Input
                            id={`evidence-label-${index}`}
                            value={evidenceLink.label}
                            disabled={isPending}
                            onChange={(event) =>
                              handleEvidenceChange(
                                index,
                                "label",
                                event.target.value
                              )
                            }
                            placeholder="GitHub repository"
                          />
                          <FieldError
                            errors={[
                              {
                                message:
                                  validationErrors.evidenceLinks?.[index]?.label
                                    ?._errors?.[0],
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
                                "kind",
                                value as EvidenceKind
                              )
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger id={`evidence-kind-${index}`}>
                              <SelectValue placeholder="Select evidence type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVIDENCE_KIND_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError
                            errors={[
                              {
                                message:
                                  validationErrors.evidenceLinks?.[index]?.kind
                                    ?._errors?.[0],
                              },
                            ]}
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor={`evidence-url-${index}`}>
                          URL
                        </FieldLabel>
                        <Input
                          id={`evidence-url-${index}`}
                          type="url"
                          value={evidenceLink.url}
                          disabled={isPending}
                          onChange={(event) =>
                            handleEvidenceChange(
                              index,
                              "url",
                              event.target.value
                            )
                          }
                          placeholder="https://github.com/..."
                        />
                        <FieldError
                          errors={[
                            {
                              message:
                                validationErrors.evidenceLinks?.[index]?.url
                                  ?._errors?.[0],
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
