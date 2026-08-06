import type { Route } from "next"
import Link from "next/link"
import { ArrowUpRight, Link2, ShieldCheck } from "lucide-react"

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
          "group relative overflow-hidden rounded-4xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-4 transition-all focus-within:border-primary/40 hover:-translate-y-0.5 hover:border-primary/30",
          className
        )}
      >
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="grid gap-5 md:grid-cols-[minmax(220px,0.36fr)_1fr] md:items-start">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted p-3">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt={`${title} cover`}
                className="size-full object-contain"
              />
            ) : (
              <div className="flex size-full flex-col justify-between bg-gradient-to-br from-primary/10 via-secondary/40 to-card p-2">
                <div className="grid grid-cols-3 gap-1.5 opacity-60">
                  <span className="h-8 rounded-xl border border-border/70 bg-card/60" />
                  <span className="h-8 rounded-xl border border-border/70 bg-card/40" />
                  <span className="h-8 rounded-xl border border-border/70 bg-card/60" />
                </div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  No cover
                </p>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                <ShieldCheck className="size-3 text-primary" />
                Proof-backed project
              </div>
              <ProjectStatusBadge status={status} />
            </div>

            {href ? (
              <Link
                href={href}
                className="line-clamp-2 rounded-sm text-base font-semibold tracking-[-0.03em] text-foreground transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:text-[1.75rem]"
              >
                {title}
              </Link>
            ) : (
              <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
                {title}
              </h3>
            )}

            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {summary}
            </p>

            {metadataLine ? (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {metadataLine}
              </p>
            ) : null}

            <p className="line-clamp-1 text-sm font-medium text-foreground/85">
              {stackPreview || "Project stack not added yet"}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3 dark:border-white/8">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/75">
                <Link2 className="size-3.5 text-primary" />
                {proofSummary ?? "No evidence yet"}
              </p>

              {href ? (
                <Link
                  href={href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  View case study
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
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-muted p-3 dark:border-white/8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={`${title} cover`}
              className="size-full object-contain"
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
