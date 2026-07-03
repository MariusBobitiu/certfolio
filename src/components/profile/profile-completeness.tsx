"use client"

import { cn } from "@/lib/utils"

type ProfileCompletenessProps = {
  hasImage: boolean
  hasHeadline: boolean
  hasBio: boolean
  hasLinks: boolean
  featuredCredsCount: number
  featuredProjectsCount: number
}

const TOTAL = 6

export function ProfileCompleteness(props: ProfileCompletenessProps) {
  const completed = [
    props.hasImage,
    props.hasHeadline,
    props.hasBio,
    props.hasLinks,
    props.featuredCredsCount > 0,
    props.featuredProjectsCount > 0,
  ].filter(Boolean).length

  const percentage = Math.round((completed / TOTAL) * 100)
  const done = completed === TOTAL

  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            done
              ? "bg-emerald-500"
              : percentage > 60
                ? "bg-primary/60"
                : "bg-primary/40"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          "shrink-0 text-[11px] font-medium",
          done
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        )}
      >
        {done ? "Profile complete" : `Profile ${percentage}% built`}
      </span>
    </div>
  )
}
