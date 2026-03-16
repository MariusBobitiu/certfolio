import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Fingerprint,
  LayoutTemplate,
  Link2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const foundationSignals = [
  "Trust signals before visual polish",
  "Structured for verification and reuse",
  "Built in phases like projects",
] as const

const rolloutPhases = [
  {
    title: "Phase 1: Page shell",
    description:
      "Lock the workspace structure, the preview card language, and the minimum fields a credential needs before introducing persistence.",
    points: [
      "Featured card layout and collection sections",
      "Minimum display model for issuer, title, dates, and verification",
      "Empty-state guidance for what belongs here",
    ],
  },
  {
    title: "Phase 2: Authoring flow",
    description:
      "Add create and edit flows once the content shape is stable enough that the form is not guessing at the schema.",
    points: [
      "Draft credential creation",
      "Issuer branding, credential URL, and optional credential code",
      "Published, draft, and expired state handling",
    ],
  },
  {
    title: "Phase 3: Schema and profile reuse",
    description:
      "Persist credentials only after the display contract is clear, then reuse the same data on profile surfaces without remapping.",
    points: [
      "Database table and relations",
      "Featured ordering and public profile modules",
      "Renewal and expiry support where relevant",
    ],
  },
] as const

const minimumFields = [
  {
    label: "Credential title",
    detail: "The exact name shown on the card and future profile modules.",
    icon: LayoutTemplate,
  },
  {
    label: "Issuer",
    detail: "Provider or institution, with room for brand treatment later.",
    icon: Building2,
  },
  {
    label: "Issue date",
    detail: "Needed immediately for card chronology and recency cues.",
    icon: CalendarDays,
  },
  {
    label: "Verification state",
    detail: "Verified, pending, or unverified should be visible from day one.",
    icon: ShieldCheck,
  },
  {
    label: "Credential code",
    detail: "Optional now, but the shape should already allow it.",
    icon: Fingerprint,
  },
  {
    label: "Verification link",
    detail: "Optional in the shell, but important enough to design for now.",
    icon: Link2,
  },
] as const

const surfaceSections = [
  {
    eyebrow: "Featured row",
    title: "High-confidence credentials first",
    description:
      "The strongest or most relevant certifications should anchor the page in a horizontally scannable band.",
  },
  {
    eyebrow: "Collection grid",
    title: "Everything else stays readable",
    description:
      "After the featured row, the rest of the collection can use a simpler listing surface with the same data contract.",
  },
  {
    eyebrow: "Status cues",
    title: "Draft, verified, expired",
    description:
      "State should be explicit so the workspace can handle unfinished entries before public reuse exists.",
  },
] as const

const previewCards = [
  {
    issuer: "AWS",
    title: "AWS Solutions Architect Associate",
    issued: "Issued May 2024",
    status: "Verified",
    accent:
      "from-zinc-900 via-stone-900 to-slate-800 text-white border-white/10",
    logo:
      "bg-linear-to-br from-zinc-800 via-zinc-900 to-black text-orange-300 border-white/12",
  },
  {
    issuer: "CompTIA",
    title: "Security+",
    issued: "Issued Oct 2023",
    status: "Verified",
    accent:
      "from-red-700 via-rose-700 to-red-800 text-white border-white/10",
    logo:
      "bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white border-white/20",
  },
  {
    issuer: "Microsoft",
    title: "Azure Fundamentals",
    issued: "Issued Sep 2022",
    status: "Verified",
    accent:
      "from-blue-700 via-indigo-700 to-blue-900 text-white border-white/10",
    logo:
      "bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white border-white/20",
  },
] as const

export function CredentialsWorkspace() {
  return (
    <div className="space-y-8">
      <section className="relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/55 px-6 py-8 shadow-lg sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:border-white/8 dark:from-background dark:via-card/30 dark:to-card/40 dark:shadow-white/2">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
            Credentials Workspace
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
              Shape credentials into proof, not just badges.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              This first pass defines what the credentials area needs to
              contain before a database table exists: the card language, the
              minimum data we trust, and the collection sections that will make
              the workspace usable.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {foundationSignals.map((signal) => (
              <div
                key={signal}
                className="rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm text-foreground/85 backdrop-blur dark:border-white/8 dark:bg-white/3"
              >
                {signal}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {rolloutPhases.map((phase) => (
          <article
            key={phase.title}
            className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md dark:border-white/8 dark:shadow-white/2"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:border-white/8 dark:bg-white/4">
                <Sparkles className="size-3.5" />
                Build sequence
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  {phase.title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {phase.description}
                </p>
              </div>
              <div className="space-y-2 border-t border-border/60 pt-4 dark:border-white/8">
                {phase.points.map((point) => (
                  <p
                    key={point}
                    className="text-sm leading-6 text-foreground/85"
                  >
                    {point}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md sm:p-8 dark:border-white/8 dark:shadow-white/2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Minimum model
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance">
              What the first credential record should already know.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              These are the fields worth designing around now, even if some stay
              optional until the authoring flow lands.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {minimumFields.map((field) => {
              const Icon = field.icon

              return (
                <div
                  key={field.label}
                  className="rounded-3xl border border-border/70 bg-background/70 p-4 dark:border-white/8 dark:bg-white/3"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-border/70 bg-card p-2.5 dark:border-white/8 dark:bg-white/4">
                      <Icon className="size-4 text-foreground/80" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold text-foreground">
                        {field.label}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {field.detail}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-4xl border border-border/70 bg-linear-to-br from-secondary/45 via-card to-primary/5 p-6 shadow-md sm:p-8 dark:border-white/8 dark:from-secondary/25 dark:via-card/30 dark:to-primary/10 dark:shadow-white/2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Page structure
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance">
              What the shell should display before persistence exists.
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            {surfaceSections.map((section) => (
              <div
                key={section.eyebrow}
                className="rounded-3xl border border-border/70 bg-card/88 p-4 dark:border-white/8 dark:bg-white/3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {section.eyebrow}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                  {section.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md sm:p-8 dark:border-white/8 dark:shadow-white/2">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-white/8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Card direction
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance">
              Initial featured certification treatment.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              This is close to the visual direction in your mock, but expressed
              as a reusable Certfolio shell instead of hard-coded one-off cards.
            </p>
          </div>

          <Badge
            variant="outline"
            className="h-auto rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
          >
            Preview only
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {previewCards.map((card) => (
            <article
              key={card.title}
              className={cn(
                "overflow-hidden rounded-[28px] border bg-linear-to-br shadow-lg",
                card.accent
              )}
            >
              <div className="space-y-5 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-18 shrink-0 items-center justify-center rounded-2xl border text-lg font-semibold tracking-[-0.03em]",
                      card.logo
                    )}
                  >
                    {card.issuer.slice(0, 3)}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <p className="text-sm font-medium text-white/78">
                      {card.issuer}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-balance">
                      {card.title}
                    </h3>
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/18 px-3 py-1 text-sm font-medium text-emerald-200 ring-1 ring-white/10">
                      <BadgeCheck className="size-4" />
                      {card.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 bg-black/12 px-5 py-4">
                <p className="text-sm font-medium text-white/82">{card.issued}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
