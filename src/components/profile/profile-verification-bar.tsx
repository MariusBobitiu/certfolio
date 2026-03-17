import { BadgeCheck, Link2, FileBadge2 } from "lucide-react"

import type { PublicCredential } from "@/data/profile"
import { cn } from "@/lib/utils"

export function ProfileVerificationBar({
  credentials,
  projectCount,
}: {
  credentials: PublicCredential[]
  projectCount: number
}) {
  const total = credentials.length
  const verified = credentials.filter(
    (c) => c.verification_status === "verified_external"
  ).length
  const linked = credentials.filter(
    (c) => c.verification_status === "linked_external"
  ).length
  const selfDeclared = credentials.filter(
    (c) => c.verification_status === "self_declared"
  ).length

  const hasContent = total > 0 || projectCount > 0

  if (!hasContent) return null

  return (
    <div className="rounded-2xl border border-border/60 bg-linear-to-br from-secondary/40 via-card to-primary/5 px-5 py-4 dark:border-white/8 dark:from-secondary/20 dark:via-card/30 dark:to-primary/8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Primary trust signal */}
        {total > 0 && (
          <div className="flex items-center gap-2">
            <BadgeCheck
              className={cn(
                "size-4 shrink-0",
                verified > 0 ? "text-emerald-500" : "text-muted-foreground"
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {verified > 0
                ? `${verified} of ${total} credential${total === 1 ? "" : "s"} independently verified`
                : `${total} credential${total === 1 ? "" : "s"} on record`}
            </span>
          </div>
        )}

        {/* Breakdown chips */}
        <div className="flex flex-wrap items-center gap-2">
          {verified > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <BadgeCheck className="size-3" />
              {verified} verified
            </span>
          )}
          {linked > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/60 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
              <Link2 className="size-3" />
              {linked} linked
            </span>
          )}
          {selfDeclared > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/6">
              <FileBadge2 className="size-3" />
              {selfDeclared} self-declared
            </span>
          )}
          {projectCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/6">
              {projectCount} project{projectCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
