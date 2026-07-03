"use client"

import { Globe, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function PublicProfileBadge({
  isPublic,
  className,
}: {
  isPublic: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        isPublic
          ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
        className
      )}
    >
      {isPublic ? (
        <Globe className="size-3" />
      ) : (
        <Lock className="size-3" />
      )}
      {isPublic ? "Public" : "Private"}
    </div>
  )
}
