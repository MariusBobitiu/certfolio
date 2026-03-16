import { CalendarDays } from "lucide-react"

import {
  getIssuerInitials,
  getIssuerTheme,
} from "@/lib/issuer-theme"
import { cn } from "@/lib/utils"

import { CredentialStatusBadge } from "./credential-status-badge"
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
  title,
  issuedOn,
  sourceType,
  status,
  verificationStatus,
  className,
}: {
  issuerDisplayName: string
  issuerThemeKey: string
  title: string
  issuedOn: string
  sourceType: "credly" | "issuer_link" | "manual" | "uploaded_certificate"
  status: "draft" | "published" | "archived"
  verificationStatus: "verified_external" | "linked_external" | "self_declared"
  className?: string
}) {
  const theme = getIssuerTheme(issuerThemeKey)

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[28px] border shadow-lg",
        theme.cardClassName,
        className
      )}
    >
      <div className="flex-1 flex flex-col gap-5 p-5">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-2xl border text-base font-semibold tracking-[-0.03em]",
                theme.logoClassName
              )}
            >
              {getIssuerInitials(issuerDisplayName)}
            </div>

            <div className="min-w-0 space-y-2 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium opacity-80">
                  {issuerDisplayName}
                </p>
                <CredentialStatusBadge
                  status={status}
                  className="shrink-0 bg-white/12 text-white dark:bg-white/12 dark:text-white"
                />
              </div>
              <h3 className="overflow-hidden text-xl font-semibold tracking-[-0.04em] wrap-break-word whitespace-pre-wrap">
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CredentialVerificationBadge
            status={verificationStatus}
            className={theme.badgeClassName}
          />
          <div className="inline-flex items-center gap-2 rounded-full bg-black/12 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/80 uppercase ring-1 ring-white/10">
            {sourceType.replace("_", " ")}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/12 px-5 py-4">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-white/82">
          <CalendarDays className="size-4" />
          Issued {formatIssuedOn(issuedOn)}
        </div>
      </div>
    </article>
  )
}
