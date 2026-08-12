import { CalendarDays } from "lucide-react"

import {
  getIssuerInitials,
  getIssuerTheme,
} from "@/lib/issuer-theme"
import { cn } from "@/lib/utils"

import { CredentialVerificationBadge } from "./credential-verification-badge"

function formatIssuedOn(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function CredentialCardPreview({
  issuerDisplayName,
  issuerThemeKey,
  issuerLogoUrl,
  title,
  issuedOn,
  verificationStatus,
  className,
}: {
  issuerDisplayName: string
  issuerThemeKey: string
  issuerLogoUrl?: string
  title: string
  issuedOn: string
  verificationStatus: "verified_external" | "linked_external" | "self_declared"
  className?: string
}) {
  const effectiveTheme =
    verificationStatus === "self_declared"
      ? getIssuerTheme("fallback")
      : getIssuerTheme(issuerThemeKey)

  const tierRing =
    verificationStatus === "verified_external"
      ? "ring-2 ring-emerald-400/40 dark:ring-emerald-500/30"
      : verificationStatus === "linked_external"
        ? "ring-1 ring-sky-400/25 dark:ring-sky-500/20"
        : ""

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[28px] border shadow-lg",
        effectiveTheme.cardClassName,
        tierRing,
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-2xl border text-base font-semibold tracking-[-0.03em]",
                effectiveTheme.logoClassName
              )}
            >
              {issuerLogoUrl ? (
                // Issuer logos can come from arbitrary provider domains.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={issuerLogoUrl}
                  alt=""
                  className="size-full rounded-[inherit] object-contain p-2"
                />
              ) : (
                getIssuerInitials(issuerDisplayName)
              )}
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium opacity-80">
                {issuerDisplayName}
              </p>
              <h3 className="overflow-hidden text-xl font-semibold tracking-[-0.04em] wrap-break-word whitespace-pre-wrap">
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CredentialVerificationBadge
            status={verificationStatus}
            className={effectiveTheme.badgeClassName}
          />
          {/* <div className="inline-flex items-center gap-2 rounded-full bg-black/12 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/80 uppercase ring-1 ring-white/10">
            {credentialSourceLabels[sourceType]}
          </div> */}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/12 px-5 py-4">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-white/82">
          <CalendarDays className="size-4" />
          Issued {formatIssuedOn(issuedOn)}
        </div>
        {verificationStatus === "self_declared" && (
          <span className="text-[10px] text-muted-foreground">
            Self-declared
          </span>
        )}
      </div>
    </article>
  )
}
