import { BadgeCheck, FileBadge2, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"

type CredentialVerificationStatus =
  | "verified_external"
  | "linked_external"
  | "self_declared"

const verificationBadgeMap: Record<
  CredentialVerificationStatus,
  { label: string; className: string; Icon: typeof BadgeCheck }
> = {
  verified_external: {
    label: "Verified",
    className:
      "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300",
    Icon: BadgeCheck,
  },
  linked_external: {
    label: "Evidence linked",
    className:
      "bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300",
    Icon: Link2,
  },
  self_declared: {
    label: "Credential Record",
    className:
      "bg-slate-500/12 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300",
    Icon: FileBadge2,
  },
}

export function CredentialVerificationBadge({
  status,
  className,
}: {
  status: CredentialVerificationStatus
  className?: string
}) {
  const badge = verificationBadgeMap[status]
  const Icon = badge.Icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase",
        badge.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {badge.label}
    </div>
  )
}
