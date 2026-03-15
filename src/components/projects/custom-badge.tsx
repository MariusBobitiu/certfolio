import { cn } from "@/lib/utils"

export function CustomBadge({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("relative pt-2", className)}>
      <span className="absolute top-1.25 left-3 z-10 rounded-full border-t border-border/70 bg-card/88 px-1 text-[6px] font-semibold tracking-[0.18em] text-muted-foreground uppercase dark:border-white/8">
        {label}
      </span>
      <span className="inline-flex h-10 w-full items-center rounded-full border border-border/70 bg-card/88 px-6 text-sm text-foreground dark:border-white/8">
        {value}
      </span>
    </div>
  )
}
