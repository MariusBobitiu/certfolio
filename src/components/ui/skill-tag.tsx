import { cn } from "@/lib/utils"

export function SkillTag({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/70 bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase",
        className,
      )}
    >
      {label}
    </span>
  )
}
