"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Route } from "next"
import { useAction } from "next-safe-action/hooks"
import { Plus } from "lucide-react"

import { ProjectCardPreview } from "@/components/projects/project-card-preview"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProjectAction } from "./action"

const editorialPrompts = [
  "What problem did this project solve?",
  "What did you specifically own or deliver?",
  "What evidence would make this work more credible later?",
] as const

type ProjectDraft = {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  projectType: string
  role: string
  summary: string
  context: string
  outcome: string
  tools: string
  evidenceCount: number
  status: "draft" | "published" | "archived"
}

type ProjectFilter = "all" | ProjectDraft["status"]

const emptyDraft: ProjectDraft = {
  id: "",
  slug: "",
  title: "",
  coverImageUrl: null,
  projectType: "",
  role: "",
  summary: "",
  context: "",
  outcome: "",
  tools: "",
  evidenceCount: 0,
  status: "draft",
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
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft)
  const [projects, setProjects] = useState<ProjectDraft[]>(initialProjects)
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { execute, isPending, result } = useAction(createProjectAction, {
    onSuccess: ({ data }) => {
      if (data?.failure || !data?.project) {
        setSubmitError(
          data?.failure ?? "We could not create the project right now."
        )
        return
      }

      setProjects((current) => [
        {
          id: data.project.id,
          slug: data.project.slug,
          title: data.project.title,
          coverImageUrl: null,
          projectType: data.project.project_type,
          role: data.project.role,
          summary: data.project.summary,
          context: data.project.context,
          outcome: data.project.outcome,
          tools: data.project.tools,
          evidenceCount: data.evidenceLinks?.length ?? 0,
          status: data.project.status,
        },
        ...current,
      ])
      setDraft(emptyDraft)
      setSubmitError(null)
      setIsDialogOpen(false)
      router.push(`/projects/${data.project.slug}` as Route)
    },
    onError: ({ error }) => {
      setSubmitError(
        error.serverError ?? "We could not create the project right now."
      )
    },
  })
  const validationErrors =
    (result.validationErrors as ActionValidationErrors | undefined) ?? {}

  const handleChange = (field: keyof ProjectDraft, value: string) => {
    if (submitError) {
      setSubmitError(null)
    }

    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDraft(emptyDraft)
      setSubmitError(null)
    }

    setIsDialogOpen(open)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    execute({
      title: draft.title,
      projectType: draft.projectType,
      role: draft.role,
      summary: draft.summary,
      coverImageKey: "",
      context: "",
      outcome: "",
      tools: "",
      evidenceLinks: [],
    })
  }

  const publishedCount = projects.filter(
    (project) => project.status === "published"
  ).length
  const draftCount = projects.filter(
    (project) => project.status === "draft"
  ).length
  const archivedCount = projects.filter(
    (project) => project.status === "archived"
  ).length
  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.status === activeFilter)
  const activeFilterLabel =
    activeFilter === "all"
      ? "All projects"
      : activeFilter === "draft"
        ? "Draft projects"
        : activeFilter === "published"
          ? "Published projects"
          : "Archived projects"
  const activeFilterDescription =
    activeFilter === "all"
      ? "Drafts, published work, and archived entries all live here until you decide how each project should evolve."
      : activeFilter === "draft"
        ? "Projects still being shaped before they are ready to be reused or shared more widely."
        : activeFilter === "published"
          ? "Projects that are ready to represent your work more confidently and cleanly."
          : "Projects you want to keep on record without leaving them in the active workflow."
  const statusFilters: Array<{
    value: ProjectFilter
    label: string
    count: number
  }> = [
    { value: "all", label: "All", count: projects.length },
    { value: "draft", label: "Drafts", count: draftCount },
    { value: "published", label: "Published", count: publishedCount },
    { value: "archived", label: "Archived", count: archivedCount },
  ]
  const hasProjects = projects.length > 0

  return (
    <>
      {hasProjects ? (
        <section className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Project Index
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Your projects should feel navigable, not buried.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Keep the collection readable at a glance, then use each project
                page to develop the fuller proof-of-work story.
              </p>
            </div>

            <Button
              className="rounded-full lg:shrink-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add new project
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
                activeFilter === "all"
                  ? "border-foreground/15 bg-card"
                  : "border-border/70 bg-card/92 hover:border-border/90"
              }`}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Total
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {projects.length}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("published")}
              className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
                activeFilter === "published"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border/70 bg-card/92 hover:border-border/90"
              }`}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Published
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {publishedCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("draft")}
              className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
                activeFilter === "draft"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border/70 bg-card/92 hover:border-border/90"
              }`}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Drafts
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {draftCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("archived")}
              className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
                activeFilter === "archived"
                  ? "border-foreground/15 bg-muted/40"
                  : "border-border/70 bg-card/92 hover:border-border/90"
              }`}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Archived
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {archivedCount}
              </p>
            </button>
          </div>

          <div className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md backdrop-blur sm:p-8 dark:border-white/8 dark:shadow-white/2">
            <div className="flex flex-col gap-5 border-b border-border/60 pb-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Collection Surface
                </p>
                <h3 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                  {activeFilterLabel}
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {activeFilterDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    variant={
                      activeFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveFilter(filter.value)}
                    className="rounded-full"
                  >
                    {filter.label}
                    <span className="text-xs opacity-80">{filter.count}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <ProjectCardPreview
                    key={project.id}
                    eyebrow={
                      activeFilter === "all" && index === 0
                        ? "Most recent"
                        : activeFilter === "all"
                          ? "Project"
                          : activeFilterLabel.replace(" projects", "")
                    }
                    title={project.title}
                    coverImageUrl={project.coverImageUrl}
                    summary={project.summary}
                    projectType={project.projectType}
                    role={project.role}
                    status={project.status}
                    context={project.context}
                    outcome={project.outcome}
                    tools={project.tools}
                    evidenceCount={project.evidenceCount}
                    href={`/projects/${project.slug}` as Route}
                    variant="listing"
                  />
                ))
              ) : (
                <div className="xl:col-span-2">
                  <div className="rounded-3xl border border-dashed border-border/70 bg-muted/35 px-5 py-6 dark:border-white/8 dark:bg-white/3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {activeFilter !== "all" ? (
                            <ProjectStatusBadge status={activeFilter} />
                          ) : null}
                          <p className="text-sm font-medium text-foreground">
                            No{" "}
                            {activeFilter === "all" ? "" : `${activeFilter} `}
                            projects yet
                          </p>
                        </div>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                          {activeFilter === "draft"
                            ? "Start a new project or move an existing one back into draft while you refine it."
                            : activeFilter === "published"
                              ? "Publish stronger project entries here once they are ready to represent your work."
                              : activeFilter === "archived"
                                ? "Archived projects will appear here once you move them out of the active workspace."
                                : "Create the first project entry to start shaping your proof-backed body of work."}
                        </p>
                      </div>

                      <Button
                        type="button"
                        className="rounded-full sm:self-start"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="size-4" />
                        Add new project
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
          <div className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md backdrop-blur sm:p-8 dark:border-white/8 dark:shadow-white/2">
            <div className="space-y-5 border-b border-border/60 pb-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                    Collection Surface
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                    No projects yet, but the first one should set the tone
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    A strong Certfolio project explains context, ownership,
                    outcome, and how the work can be trusted. Start with one
                    project you can describe clearly, then deepen it over time.
                  </p>
                </div>

                <Button
                  className="rounded-full lg:shrink-0"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="size-4" />
                  Add new project
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-border/70 bg-secondary/45 p-5 dark:border-white/7">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Editorial Guidance
                </p>
                <div className="mt-4 space-y-3">
                  {editorialPrompts.map((prompt, index) => (
                    <div key={prompt} className="flex gap-4">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-sm font-medium text-foreground dark:bg-white/6">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-sm leading-6 text-muted-foreground sm:text-base">
                        {prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/45 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.035]">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Start with a project that can carry your story
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Choose work you can explain well now and support with
                    stronger proof later.
                  </p>
                </div>
                <Button
                  className="rounded-full sm:self-start"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="size-4" />
                  Add new project
                </Button>
              </div>
            </div>
          </div>

          <aside className="rounded-4xl border border-border/70 bg-card/90 p-6 shadow-md backdrop-blur sm:p-8 dark:border-white/8 dark:shadow-white/2">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Workspace Notes
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Projects should read like evidence, not inventory
              </h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Each project should eventually communicate context, ownership,
                outcomes, and supporting proof in a recruiter-friendly way.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/70 bg-secondary/45 p-5 dark:border-white/7">
                <p className="text-sm font-medium text-foreground">
                  What to strengthen next
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Add clearer outcomes, better evidence, and stronger
                  project-specific storytelling so each card feels like
                  proof-of-work rather than a summary block.
                </p>
              </div>

              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/45 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                <p className="text-sm font-medium text-foreground">
                  Coming later
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Evidence links, richer project fields, public profile reuse,
                  and a more robust filtering system still remain out of scope
                  for this phase.
                </p>
              </div>
            </div>
          </aside>
        </section>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-5 sm:px-7">
              <DialogTitle className="text-2xl font-semibold tracking-[-0.03em]">
                Add new project
              </DialogTitle>
              <DialogDescription className="max-w-xl leading-6">
                Start with the essentials here. After creating the draft, you
                will be taken straight to the project page to add the cover,
                context, outcome, stack, and evidence.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-6 sm:px-7">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="project-title">Project title</FieldLabel>
                  <Input
                    id="project-title"
                    value={draft.title}
                    disabled={isPending}
                    onChange={(event) =>
                      handleChange("title", event.target.value)
                    }
                    placeholder="Internal tooling rollout for support operations"
                    required
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
                      value={draft.projectType}
                      disabled={isPending}
                      onChange={(event) =>
                        handleChange("projectType", event.target.value)
                      }
                      placeholder="Automation, infrastructure, software, security"
                      required
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
                      value={draft.role}
                      disabled={isPending}
                      onChange={(event) =>
                        handleChange("role", event.target.value)
                      }
                      placeholder="Engineer, student, consultant, team lead"
                      required
                    />
                    <FieldError
                      errors={[
                        { message: validationErrors.role?._errors?.[0] },
                      ]}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="project-summary">
                    Project summary
                  </FieldLabel>
                  <Textarea
                    id="project-summary"
                    value={draft.summary}
                    disabled={isPending}
                    onChange={(event) =>
                      handleChange("summary", event.target.value)
                    }
                    placeholder="Describe the problem, what you delivered, and why the project matters."
                    className="min-h-32"
                    required
                  />
                  <FieldError
                    errors={[
                      { message: validationErrors.summary?._errors?.[0] },
                    ]}
                  />
                  <FieldDescription>
                    Keep this concise. You can add the cover, context, outcome,
                    stack, and evidence on the project page next.
                  </FieldDescription>
                </Field>

                <FieldError
                  errors={submitError ? [{ message: submitError }] : []}
                />
              </FieldGroup>
            </div>

            <DialogFooter className="border-t border-border/60 px-6 py-5 sm:px-7">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Create and continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
