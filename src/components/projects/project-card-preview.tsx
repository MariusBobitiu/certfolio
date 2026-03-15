import type { Route } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { CustomBadge } from "@/components/projects/custom-badge"
import { cn } from "@/lib/utils"

import { ProjectStatusBadge } from "./project-status-badge"

type ProjectStatus = "draft" | "published" | "archived"

type ProjectCardPreviewProps = {
  eyebrow: string
  title: string
  coverImageUrl?: string | null
  summary: string
  projectType: string
  role: string
  status: ProjectStatus
  context?: string
  outcome?: string
  tools?: string
  evidenceCount?: number
  variant?: "listing" | "preview"
  href?: Route
  className?: string
}

export function ProjectCardPreview({
  eyebrow,
  title,
  coverImageUrl,
  summary,
  projectType,
  role,
  status,
  context = "",
  outcome = "",
  tools = "",
  evidenceCount = 0,
  variant = "listing",
  href,
  className,
}: ProjectCardPreviewProps) {
  const isPreview = variant === "preview"
  const hasProofSignals = Boolean(
    context || outcome || tools || evidenceCount > 0
  )
  const stackPreview = tools
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ")
  const proofSummary =
    evidenceCount > 0
      ? `${evidenceCount} evidence link${evidenceCount === 1 ? "" : "s"}`
      : context || outcome
        ? "Context and outcome captured"
        : null
  const metadataLine = [projectType, role].filter(Boolean).join(" · ")

  if (!isPreview) {
    return (
      <article
        className={cn(
          "group overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-secondary/45 via-card to-primary/5 p-4 transition-colors hover:border-border/90 dark:border-white/8 dark:from-secondary/25 dark:via-card/35 dark:to-primary/10",
          className
        )}
      >
        <div className="h-full grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-stretch">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 dark:border-white/8">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt={`${title} cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-40 items-end bg-linear-to-br from-primary/20 via-secondary/30 to-card p-4">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  No cover
                </p>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 h-full flex-col justify-between">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                {href ? (
                  <Link
                    href={href}
                    className="line-clamp-2 block text-base font-semibold tracking-[-0.02em] text-foreground transition-opacity hover:opacity-80 sm:text-xl"
                  >
                    {title}
                  </Link>
                ) : (
                  <h3 className="line-clamp-2 block text-base font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
                    {title}
                  </h3>
                )}

                <ProjectStatusBadge status={status} className="shrink-0" />
              </div>
              <div className="flex-1 min-h-16 mt-2">
                <p className="flex-1 line-clamp-2 max-w-3xl text-xs leading-5 text-muted-foreground sm:text-sm">
                  {summary}
                </p>
              </div>

              {metadataLine ? (
                <p className="line-clamp-1 text-muted-foreground text-sm">
                  {metadataLine}
                </p>
              ) : null}

              <p className="line-clamp-1 text-sm font-medium text-foreground/85">
                {stackPreview || "Project stack not added yet"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 mt-2 pt-0.5 dark:border-white/8">
              <p className="text-xs leading-6 text-foreground/75">
                {proofSummary ?? "No evidence yet"}
              </p>

              {href ? (
                <Link
                  href={href}
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open project
                  <ArrowUpRight className="size-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "flex flex-col rounded-3xl border border-border/70 bg-linear-to-br from-secondary/55 via-card to-primary/5 p-5 dark:border-white/7 dark:from-secondary/30 dark:via-card/30 dark:to-primary/10",
        "min-h-0",
        className
      )}
    >
      <div className="space-y-4">
        {coverImageUrl ? (
          <div className="aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card/60 dark:border-white/8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={`${title} cover`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase dark:border-white/8 dark:bg-white/4">
            {eyebrow}
          </div>
          <ProjectStatusBadge status={status} />
        </div>

        <div className="space-y-3">
          {href ? (
            <Link
              href={href}
              className="line-clamp-2 min-h-16 text-2xl font-semibold tracking-[-0.04em] text-foreground transition-opacity hover:opacity-80"
            >
              {title}
            </Link>
          ) : (
            <h3
              className={cn(
                "font-semibold tracking-[-0.04em] text-balance text-foreground",
                isPreview
                  ? "text-3xl sm:line-clamp-2 sm:min-h-12"
                  : "line-clamp-2 min-h-18 text-2xl"
              )}
            >
              {title}
            </h3>
          )}

          <p
            className={cn(
              "text-sm leading-7 text-muted-foreground",
              isPreview
                ? "sm:line-clamp-5 sm:min-h-32"
                : "line-clamp-4 min-h-32"
            )}
          >
            {summary}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap content-start gap-2">
        <CustomBadge label="Type" value={projectType} />
        <CustomBadge label="Role" value={role} />
      </div>

      {hasProofSignals ? (
        <div className="mt-5 border-t border-border/50 pt-4 dark:border-white/8">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {stackPreview ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Stack
                </p>
                <p className="text-sm leading-6 text-foreground/80">
                  {stackPreview}
                </p>
              </div>
            ) : null}

            {proofSummary ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Proof
                </p>
                <p className="text-sm leading-6 text-foreground/80">
                  {proofSummary}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="pt-6">
        <p className="text-sm font-medium text-primary">
          How this card would read to someone else
        </p>
      </div>
    </article>
  )
}
