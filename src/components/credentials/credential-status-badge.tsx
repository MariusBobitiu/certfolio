import { cn } from "@/lib/utils"

type CredentialStatus = "draft" | "published" | "archived"

const toneMap: Record<CredentialStatus, string> = {
  draft: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  archived: "bg-muted text-muted-foreground",
}

export function CredentialStatusBadge({
  status,
  className,
}: {
  status: CredentialStatus
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        toneMap[status],
        className
      )}
    >
      {status}
    </div>
  )
}
