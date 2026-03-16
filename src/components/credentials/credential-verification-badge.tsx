import { BadgeCheck, Link2, PencilLine } from "lucide-react"

import { cn } from "@/lib/utils"

type CredentialVerificationStatus =
  | "verified_external"
  | "linked_external"
  | "self_declared"

const toneMap: Record<
  CredentialVerificationStatus,
  { label: string; className: string; Icon: typeof BadgeCheck }
> = {
  verified_external: {
    label: "Verified external",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    Icon: BadgeCheck,
  },
  linked_external: {
    label: "Linked external",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    Icon: Link2,
  },
  self_declared: {
    label: "Self declared",
    className: "bg-muted text-muted-foreground",
    Icon: PencilLine,
  },
}

export function CredentialVerificationBadge({
  status,
  className,
}: {
  status: CredentialVerificationStatus
  className?: string
}) {
  const tone = toneMap[status]
  const Icon = tone.Icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase",
        tone.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {tone.label}
    </div>
  )
}
