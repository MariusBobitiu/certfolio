import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { CredentialVerificationBadge } from "@/components/credentials/credential-verification-badge"
import { getIssuerInitials, getIssuerTheme } from "@/lib/issuer-theme"

function formatIssuedOn(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

/**
 * Landing-only compact credential preview.
 *
 * Visually references the real CredentialCardPreview via:
 * - same border radius (rounded-[28px])
 * - same verification colour
 * - same issuer icon treatment
 * - same badge styling
 * - same typography family
 * - same light / dark surface tokens
 *
 * Designed to fit inside narrow marketing layouts without
 * scaling full desktop credential cards.
 */
export function LandingCredentialPreview({
  issuerDisplayName,
  issuerThemeKey,
  title,
  issuedOn,
  verificationStatus,
  className,
}: {
  issuerDisplayName: string
  issuerThemeKey: string
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

  const isDarkCard = verificationStatus !== "self_declared"

  return (
    <article
      className={cn(
        "flex items-center gap-3 overflow-hidden rounded-[28px] border p-3 shadow-md",
        effectiveTheme.cardClassName,
        tierRing,
        className,
      )}
    >
      {/* Issuer icon — matching production size-10 rounded-xl treatment */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold tracking-[-0.03em]",
          effectiveTheme.logoClassName,
        )}
      >
        {getIssuerInitials(issuerDisplayName)}
      </div>

      {/* Title + issuer + verification */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium opacity-70 leading-tight">
          {issuerDisplayName}
        </p>
        <h4
          className="mt-0.5 text-sm font-semibold tracking-[-0.03em] leading-snug text-balance"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "normal",
            overflowWrap: "normal",
            hyphens: "none",
          }}
        >
          {title}
        </h4>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <CredentialVerificationBadge
            status={verificationStatus}
            className={cn("text-[10px] px-2 py-0.5", effectiveTheme.badgeClassName)}
          />
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium",
              isDarkCard
                ? "text-white/60"
                : "text-muted-foreground dark:text-white/60",
            )}
          >
            <CalendarDays className="size-3 opacity-70" />
            {formatIssuedOn(issuedOn)}
          </span>
        </div>
      </div>
    </article>
  )
}
