import { ShieldCheck, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ProjectStatus = "draft" | "published" | "archived"

const statusLabel: Record<ProjectStatus, string> = {
  draft: "draft",
  published: "published",
  archived: "archived",
}

const statusClass: Record<ProjectStatus, string> = {
  draft: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  archived: "bg-slate-500/10 text-slate-500 dark:text-slate-400",
}

/**
 * Landing-only compact project preview.
 *
 * Shows only: status, title, 2-line summary, stack, evidence count.
 * Omits type/role as large input-like controls.
 */
export function LandingProjectPreview({
  title,
  summary,
  status,
  tools,
  evidenceCount,
  className,
}: {
  title: string
  summary: string
  status: ProjectStatus
  tools: string
  evidenceCount: number
  className?: string
}) {
  const stackPreview = tools
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ")

  return (
    <article
      className={cn(
        "flex flex-col gap-3 overflow-hidden rounded-[28px] border border-border bg-linear-to-br from-card via-card to-secondary/30 p-4 shadow-md dark:border-white/8 dark:from-card dark:to-white/3",
        className,
      )}
    >
      {/* Status + proof badge */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
            statusClass[status],
          )}
        >
          {statusLabel[status]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase dark:border-white/8">
          <ShieldCheck className="size-2.5 text-primary" />
          Proof-backed
        </span>
      </div>

      {/* Title */}
      <h4
        className="text-sm font-semibold tracking-[-0.03em] text-foreground"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "normal",
          overflowWrap: "normal",
          hyphens: "none",
        }}
      >
        {title}
      </h4>

      {/* Summary */}
      <p
        className="text-xs leading-5 text-muted-foreground"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "normal",
          overflowWrap: "normal",
          hyphens: "none",
        }}
      >
        {summary}
      </p>

      {/* Stack */}
      {stackPreview && (
        <p className="text-[10px] font-medium text-foreground/75 line-clamp-1">
          {stackPreview}
        </p>
      )}

      {/* Evidence count */}
      <div className="mt-auto flex items-center gap-1.5 border-t border-border/50 pt-2 dark:border-white/8">
        <Link2 className="size-3 text-primary" />
        <span className="text-[10px] font-medium text-foreground/75">
          {evidenceCount} evidence link{evidenceCount !== 1 ? "s" : ""}
        </span>
      </div>
    </article>
  )
}
