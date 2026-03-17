import { cn } from "@/lib/utils"

export function ProfileSectionHeader({
  label,
  count,
  className,
}: {
  label: string
  count?: number
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <h2 className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </h2>
      {count !== undefined && (
        <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/60 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground dark:border-white/8 dark:bg-white/6">
          {count}
        </span>
      )}
    </div>
  )
}
