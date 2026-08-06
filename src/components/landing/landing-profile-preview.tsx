import { ShieldCheck, Sparkles, Github, Linkedin, Globe } from "lucide-react"
import { LandingCredentialPreview } from "@/components/landing/landing-credential-preview"
import { elena, elenaCredentials, elenaSkills, elenaLinks } from "@/data/landing-seed"

const linkIcons = { github: Github, linkedin: Linkedin, website: Globe } as const

/**
 * Landing-only cropped profile preview for the product demo section.
 *
 * Shows only: identity, about summary, professional links,
 * and the beginning of the credentials section.
 *
 * Content is intentionally cropped with overflow: hidden and a
 * bottom fade to suggest a product screenshot inside a frame.
 */
export function LandingProfilePreview({ className }: { className?: string }) {
  const verifiedCount = elenaCredentials.filter(
    (c) => c.verificationStatus === "verified_external",
  ).length

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-4xl border border-border bg-card shadow-md">
        <div className="h-1 bg-linear-to-r from-primary via-primary/70 to-primary/30" />

        <div className="p-5 sm:p-6">
          {/* Context label */}
          <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
            <Sparkles className="size-3.5" />
            Certfolio public profile
          </div>

          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl border border-border bg-linear-to-br from-primary/15 via-secondary to-card text-base font-semibold tracking-[-0.03em] text-foreground shadow-sm ring-1 ring-primary/20 sm:size-16 sm:text-lg">
              {elena.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-lg font-semibold tracking-[-0.04em] text-foreground sm:text-xl">
                  {elena.name}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                  <ShieldCheck className="size-2.5" />
                  Verified
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{elena.role}</p>
              <p className="text-xs text-muted-foreground">
                {verifiedCount} verified credentials · {elenaCredentials.length} credentials · {elenaSkills.length} skills
              </p>
            </div>
          </div>

          {/* About / headline */}
          <p className="mt-4 text-sm leading-7 text-foreground/80">
            {elena.headline}
          </p>

          {/* Professional links */}
          <div className="mt-4 flex flex-wrap gap-2">
            {elenaLinks.map((link) => {
              const Icon = linkIcons[link.platform]
              return (
                <span
                  key={link.platform}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  <span>{link.label}</span>
                </span>
              )
            })}
          </div>

          {/* Credentials section header */}
          <div className="mt-5 space-y-1">
            <h4 className="text-sm font-semibold tracking-[-0.02em] text-foreground">
              Credentials
            </h4>
            <p className="text-xs text-muted-foreground">
              {elenaCredentials.length} credentials · {verifiedCount} independently verified
            </p>
          </div>

          {/* Compact credential previews (beginning of section — intentionally cropped) */}
          <div className="mt-3 space-y-2">
            {elenaCredentials.slice(0, 2).map((cred) => (
              <LandingCredentialPreview
                key={cred.id}
                issuerDisplayName={cred.issuerDisplayName}
                issuerThemeKey={cred.issuerThemeKey}
                title={cred.title}
                issuedOn={cred.issuedOn}
                verificationStatus={cred.verificationStatus}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
