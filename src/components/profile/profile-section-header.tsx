import { cn } from "@/lib/utils"

export function ProfileSectionHeader({
  label,
  count,
  subtitle,
  className,
}: {
  label: string
  count?: number
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">
          {label}
        </h2>
        {count !== undefined && (
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase dark:border-white/10 dark:bg-white/5">
            {count}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
