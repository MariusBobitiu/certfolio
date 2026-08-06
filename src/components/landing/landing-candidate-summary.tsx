import { BadgeCheck, BriefcaseBusiness, ShieldCheck, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Landing-only candidate summary card.
 *
 * Displays four compact metrics in a 2×2 grid, styled to match
 * the visual density of the other audience-section cards.
 */
export function LandingCandidateSummary({
  verifiedCount,
  credentialCount,
  projectCount,
  evidenceCount,
  className,
}: {
  verifiedCount: number
  credentialCount: number
  projectCount: number
  evidenceCount: number
  className?: string
}) {
  const metrics = [
    { icon: BadgeCheck, label: "Verified", value: verifiedCount },
    { icon: ShieldCheck, label: "Credentials", value: credentialCount },
    { icon: BriefcaseBusiness, label: "Projects", value: projectCount },
    { icon: Link2, label: "Evidence", value: evidenceCount },
  ] as const

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-5 dark:border-white/8",
        className
      )}
    >
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        Candidate summary
      </p>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col justify-between rounded-2xl border border-border/70 bg-secondary/30 p-3 dark:border-white/8 dark:bg-white/4"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              <Icon className="size-3" />
              {label}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}
