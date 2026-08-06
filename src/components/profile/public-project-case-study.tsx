import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

import type { PublicProjectCaseStudy } from "@/data/profile"
import { cn } from "@/lib/utils"

const evidenceKindLabels: Record<string, string> = {
  repository: "Repository",
  demo: "Live demo",
  documentation: "Documentation",
  write_up: "Write-up",
  case_study: "Case study",
  other: "Other",
}

function splitTools(tools: string) {
  return tools
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean)
}

function getUrlHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return url
  }
}

function Paragraphs({ value }: { value: string }) {
  return (
    <div className="max-w-3xl space-y-4 text-sm leading-7 whitespace-pre-line text-muted-foreground sm:text-base sm:leading-8">
      {value}
    </div>
  )
}

function ProjectImage({
  project,
  className,
}: {
  project: PublicProjectCaseStudy
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-4xl border border-border bg-linear-to-br from-primary/[0.06] to-card",
        className
      )}
    >
      {project.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover_image_url}
          alt={`${project.title} cover image`}
          className="aspect-[16/9] max-h-[560px] w-full object-contain"
        />
      ) : (
        <div className="flex aspect-[16/9] max-h-[560px] w-full flex-col justify-between bg-gradient-to-br from-primary/10 via-secondary/45 to-card p-5 sm:p-8">
          <div className="grid grid-cols-3 gap-2 opacity-75 sm:gap-3">
            <span className="h-14 rounded-2xl border border-border/70 bg-card/70 sm:h-20 sm:rounded-3xl" />
            <span className="h-14 rounded-2xl border border-border/70 bg-card/45 sm:h-20 sm:rounded-3xl" />
            <span className="h-14 rounded-2xl border border-border/70 bg-card/70 sm:h-20 sm:rounded-3xl" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Project case study
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-foreground/80">
              Cover image has not been added for this project yet.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function PublicProjectHero({
  project,
}: {
  project: PublicProjectCaseStudy
}) {
  const tools = splitTools(project.tools)

  return (
    <section className="rounded-4xl border border-border bg-card p-5 sm:p-7 lg:p-8">
      <Link
        href={`/u/${project.owner.slug}`}
        className="inline-flex items-center gap-2 rounded-full text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        Back to {project.owner.name}&apos;s profile
      </Link>

      <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/45 px-3 py-1">
          <ShieldCheck className="size-3.5 text-primary" />
          Proof-backed project
        </span>
        <span className="text-emerald-600 dark:text-emerald-300">
          Published case study
        </span>
        <span>
          {project.evidence.length} evidence link
          {project.evidence.length === 1 ? "" : "s"}
        </span>
      </div>

      <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-balance text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.02]">
        {project.title}
      </h1>

      <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        {project.summary}
      </p>

      <div className="mt-6 border-t border-border/70 pt-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
          <SummaryMetric label="Role" value={project.role} />
          <SummaryMetric label="Project type" value={project.project_type} />
        </div>

        {tools.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="max-w-full rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm text-foreground/85"
              >
                {tool}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <ProjectImage project={project} className="mt-6" />
    </section>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium break-words text-foreground sm:text-base">
        {value}
      </p>
    </div>
  )
}

export function ProjectNarrative({
  project,
}: {
  project: PublicProjectCaseStudy
}) {
  const sections = [
    project.context.trim()
      ? { title: "The context", body: project.context.trim() }
      : null,
    project.summary.trim()
      ? { title: "The work", body: project.summary.trim() }
      : null,
    project.outcome.trim()
      ? { title: "Outcome and impact", body: project.outcome.trim() }
      : null,
  ].filter((section): section is { title: string; body: string } =>
    Boolean(section)
  )

  if (sections.length === 0) return null

  return (
    <section className="space-y-8">
      {sections.map((section) => (
        <article key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
            {section.title}
          </h2>
          <Paragraphs value={section.body} />
        </article>
      ))}
    </section>
  )
}

export function ProjectContribution({
  project,
}: {
  project: PublicProjectCaseStudy
}) {
  const tools = splitTools(project.tools)

  return (
    <section className="rounded-4xl border border-border bg-card p-6 sm:p-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Role and contribution
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Stored ownership details
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryMetric label="Role" value={project.role} />
          <SummaryMetric label="Project type" value={project.project_type} />
        </div>

        {tools.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
              Tools and technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="max-w-full rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm text-foreground/85"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function ProjectEvidenceList({
  project,
}: {
  project: PublicProjectCaseStudy
}) {
  return (
    <section className="border-t border-border/70 pt-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Supporting evidence
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Evidence linked
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            These links support the project story. They are separate from
            independently verified credentials.
          </p>
        </div>

        {project.evidence.length > 0 ? (
          <div className="grid gap-3">
            {project.evidence.map((item) => {
              const host = getUrlHost(item.url)

              return (
                <article
                  key={`${item.kind}-${item.url}`}
                  className="rounded-3xl border border-border/70 bg-secondary/30 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2 sm:space-y-1">
                      <span className="inline-flex rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        {evidenceKindLabels[item.kind] ?? "Evidence"}
                      </span>
                      <h3 className="text-base font-semibold tracking-[-0.02em] break-words text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-sm break-all text-muted-foreground">
                        {host}
                      </p>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open supporting evidence: ${item.label}`}
                      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      Open evidence
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 bg-muted/35 px-5 py-6">
            <p className="text-sm font-medium text-foreground">
              No public evidence links have been added to this project yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The project information remains self-declared until supporting
              links or verified credentials are attached elsewhere in Certfolio.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export function PublicProjectCaseStudyPage({
  project,
}: {
  project: PublicProjectCaseStudy
}) {
  return (
    <main className="min-h-dvh overflow-hidden bg-background">
      <div className="relative isolate">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-96"
          style={{
            background: `linear-gradient(to bottom, ${project.accent_colour}18, ${project.accent_colour}08, transparent)`,
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
          <div className="mb-8 flex items-center justify-between rounded-full border border-border bg-card/80 px-4 py-3">
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.34em] text-foreground uppercase transition-opacity hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Certfolio
            </Link>
            <Link
              href={`/u/${project.owner.slug}`}
              className="inline-flex items-center gap-2 rounded-full text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Profile
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-6">
            <PublicProjectHero project={project} />

            <article className="rounded-4xl border border-border bg-card p-6 sm:p-8">
              <div className="mb-8 space-y-2">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Case study
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  How the project came together
                </h2>
              </div>
              <ProjectNarrative project={project} />
              <ProjectEvidenceList project={project} />
            </article>
          </div>
        </div>
      </div>
    </main>
  )
}
