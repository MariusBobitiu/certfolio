"use client"

import Link from "next/link"
import { Plus, X } from "lucide-react"

import { ProjectCardPreview } from "@/components/projects/project-card-preview"
import { ProfileSectionHeader } from "@/components/profile/profile-section-header"
import type { PublishedProjectForPicker } from "@/data/profile-management"
import { cn } from "@/lib/utils"

type ProfileFeaturedProjectsProps = {
  projects: PublishedProjectForPicker[]
  selectedIds: string[]
  onChangeAction: (ids: string[]) => void
}

const MAX = 4

export function ProfileFeaturedProjects({
  projects,
  selectedIds,
  onChangeAction,
}: ProfileFeaturedProjectsProps) {
  const featured = projects.filter((p) => selectedIds.includes(p.id))
  const unfetured = projects.filter((p) => !selectedIds.includes(p.id))

  const addItem = (id: string) => {
    if (selectedIds.length >= MAX) return
    onChangeAction([...selectedIds, id])
  }

  const removeItem = (id: string) => {
    onChangeAction(selectedIds.filter((sid) => sid !== id))
  }

  if (projects.length === 0) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <ProfileSectionHeader
          label="Featured projects"
          subtitle="Projects you feature will appear on your public profile."
        />
        <div className="mt-5 flex min-h-30 items-center justify-center rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No published projects yet.{" "}
            <Link
              href="/projects"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              Publish projects
            </Link>{" "}
            to feature them here.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <ProfileSectionHeader
        label="Featured projects"
        subtitle={
          selectedIds.length > 0
            ? `${selectedIds.length} of ${MAX} featured on your public profile`
            : "Select projects to feature on your public profile"
        }
        count={selectedIds.length > 0 ? selectedIds.length : undefined}
      />

      <div className="mt-5 space-y-8">
        {/* Featured items — card grid */}
        {featured.length > 0 ? (
          <div className="flex flex-col gap-4">
            {featured.map((proj) => (
              <div key={proj.id} className="group relative">
                <ProjectCardPreview
                  eyebrow=""
                  title={proj.title}
                  summary={proj.summary}
                  coverImageUrl={proj.cover_image_url}
                  projectType={proj.project_type}
                  role={proj.role}
                  status="published"
                  context={proj.context}
                  outcome={proj.outcome}
                  tools={proj.tools}
                  evidenceCount={proj.evidence_count}
                  variant="listing"
                />
                {/* Remove button overlay */}
                <button
                  type="button"
                  onClick={() => removeItem(proj.id)}
                  className="absolute top-3 right-3 z-10 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 ring-1 ring-border/40 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${proj.title} from featured`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No projects featured — all published projects will appear on your
            public profile.
          </p>
        )}

        {/* Unfeatured "add more" list */}
        {unfetured.length > 0 && (
          <div className="space-y-1">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Add more
            </p>
            <div className="space-y-1">
              {unfetured.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => addItem(proj.id)}
                  disabled={selectedIds.length >= MAX}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    selectedIds.length >= MAX
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-secondary/60"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      selectedIds.length >= MAX
                        ? "border-border/40 text-muted-foreground/30"
                        : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    <Plus className="size-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {proj.title}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border/60 bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {proj.project_type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
