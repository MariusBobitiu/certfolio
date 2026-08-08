import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CircleCheckBig,
  Clock3,
  Eye,
  EyeOff,
  FileBadge2,
  FolderKanban,
  Link2,
  ListChecks,
  Plus,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { DashboardAction, DashboardData } from "@/data/dashboard"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("en-GB")
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const actionIcons: Record<DashboardAction["icon"], LucideIcon> = {
  credential: ShieldCheck,
  checklist: ListChecks,
  warning: TriangleAlert,
  project: FolderKanban,
  evidence: Link2,
  profile: UserRound,
  complete: Sparkles,
  add: Plus,
}

function DashboardHero({ name, data }: { name: string; data: DashboardData }) {
  const firstName = name.trim().split(/\s+/)[0] || "there"

  return (
    <section className="overflow-hidden rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/45 shadow-lg dark:border-white/8 dark:from-background dark:via-card/25 dark:to-card/35 dark:shadow-white/2">
      <div className="grid gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Portfolio overview
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                data.profile.public
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
              )}
            >
              {data.profile.public ? (
                <Eye className="size-3" />
              ) : (
                <EyeOff className="size-3" />
              )}
              {data.profile.public ? "Profile live" : "Profile private"}
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              Welcome back, {firstName}.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              You have {data.publishedTotal} published{" "}
              {data.publishedTotal === 1 ? "item" : "items"} telling your
              professional story. Here is what is strong and what to work on
              next.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {data.profile.publicHref && data.profile.public ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href={data.profile.publicHref}>
                <Eye />
                View public profile
              </Link>
            </Button>
          ) : null}
          <Button asChild size="lg" className="rounded-full">
            <Link href="/profile">
              Manage profile
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  detail,
  Icon,
}: {
  label: string
  value: number
  detail: string
  Icon: LucideIcon
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/92 p-5 shadow-sm dark:border-white/8 dark:bg-card/70">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </p>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
        {numberFormatter.format(value)}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  )
}

function PortfolioStats({ data }: { data: DashboardData }) {
  const stats = data.stats

  return (
    <section
      aria-label="Portfolio totals"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="Published credentials"
        value={stats.publishedCredentials}
        detail={
          stats.draftCredentials > 0
            ? `${stats.draftCredentials} ${stats.draftCredentials === 1 ? "draft" : "drafts"} still private`
            : "All credential records are up to date"
        }
        Icon={FileBadge2}
      />
      <StatCard
        label="Independently verified"
        value={stats.verifiedCredentials}
        detail={
          stats.linkedCredentials > 0
            ? `Plus ${stats.linkedCredentials} linked externally`
            : "Of your published credentials"
        }
        Icon={BadgeCheck}
      />
      <StatCard
        label="Published projects"
        value={stats.publishedProjects}
        detail={
          stats.draftProjects > 0
            ? `${stats.draftProjects} ${stats.draftProjects === 1 ? "draft" : "drafts"} in progress`
            : "Proof of your work and outcomes"
        }
        Icon={BriefcaseBusiness}
      />
      <StatCard
        label="Evidence links"
        value={stats.evidenceCount}
        detail={
          stats.publishedProjects > 0
            ? `Across ${stats.publishedProjects} published ${stats.publishedProjects === 1 ? "project" : "projects"}`
            : "Add projects to connect evidence"
        }
        Icon={Link2}
      />
    </section>
  )
}

function NextActions({ actions }: { actions: DashboardAction[] }) {
  return (
    <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md sm:p-7 dark:border-white/8 dark:bg-card/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Next best steps
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Keep your portfolio moving
          </h2>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ListChecks className="size-5" />
        </div>
      </div>

      <div className="mt-6 divide-y divide-border/60">
        {actions.map((action) => {
          const Icon = actionIcons[action.icon]

          return (
            <div
              key={action.title}
              className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                  action.tone === "primary" && "bg-primary/10 text-primary",
                  action.tone === "warning" &&
                    "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  action.tone === "neutral" &&
                    "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold tracking-[-0.02em]">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <Link
                href={action.href}
                className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
              >
                {action.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function EmptyRecentWork() {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-border bg-secondary/25 px-6 py-9 text-center">
      <p className="font-medium">Your workspace is ready.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a credential or project and it will appear here.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/credentials">Add credential</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/projects">Add project</Link>
        </Button>
      </div>
    </div>
  )
}

function RecentWork({ data }: { data: DashboardData }) {
  return (
    <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md sm:p-7 dark:border-white/8 dark:bg-card/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Recently updated
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Your latest work
          </h2>
        </div>
        {data.recentItems.length > 0 ? (
          <span className="hidden text-xs text-muted-foreground sm:block">
            Most recent first
          </span>
        ) : null}
      </div>

      {data.recentItems.length > 0 ? (
        <div className="mt-6 divide-y divide-border/60">
          {data.recentItems.map((item) => {
            const Icon = item.type === "Credential" ? ShieldCheck : FolderKanban

            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-muted-foreground transition-colors group-hover:text-foreground dark:border-white/8">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">
                      {item.title}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] uppercase",
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.type} · {item.context}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
                  <Clock3 className="size-3.5" />
                  {dateFormatter.format(item.updatedAt)}
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            )
          })}
        </div>
      ) : (
        <EmptyRecentWork />
      )}
    </section>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-label="Profile completeness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          value === 100 ? "bg-emerald-500" : "bg-primary"
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function ProfileReadiness({ data }: { data: DashboardData }) {
  const profile = data.profile

  return (
    <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md dark:border-white/8 dark:bg-card/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Profile readiness
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            {profile.completeness}%
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl",
            profile.completeness === 100
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : "bg-primary/10 text-primary"
          )}
        >
          {profile.completeness === 100 ? (
            <CircleCheckBig className="size-5" />
          ) : (
            <UserRound className="size-5" />
          )}
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar value={profile.completeness} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {profile.completedChecks} of {profile.checks.length} profile signals
          complete
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {profile.checks.map((check) => (
          <li key={check.label} className="flex items-center gap-3 text-sm">
            <CircleCheckBig
              className={cn(
                "size-4 shrink-0",
                check.complete ? "text-emerald-500" : "text-muted-foreground/35"
              )}
            />
            <span
              className={cn(
                check.complete ? "text-foreground/80" : "text-muted-foreground"
              )}
            >
              {check.label}
            </span>
          </li>
        ))}
      </ul>

      <Button asChild variant="outline" className="mt-6 w-full rounded-full">
        <Link href="/profile">
          {profile.completeness === 100 ? "Review profile" : "Complete profile"}
          <ArrowRight />
        </Link>
      </Button>
    </section>
  )
}

function CredentialHealth({ data }: { data: DashboardData }) {
  const rows = [
    { label: "Verified externally", value: data.stats.verifiedCredentials },
    { label: "Linked externally", value: data.stats.linkedCredentials },
    {
      label: "Expiring within 90 days",
      value: data.credentialHealth.expiring,
      attention: data.credentialHealth.expiring > 0,
    },
    {
      label: "Expired",
      value: data.credentialHealth.expired,
      danger: data.credentialHealth.expired > 0,
    },
  ]

  return (
    <section className="rounded-4xl border border-border/70 bg-linear-to-br from-primary/10 via-card to-card p-6 shadow-md dark:border-white/8 dark:from-primary/12 dark:via-card/70 dark:to-card/70">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Credential health
          </p>
          <h2 className="mt-1 font-semibold">Your trust signals</h2>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={cn(
                "font-semibold",
                row.attention && "text-amber-700 dark:text-amber-300",
                row.danger && "text-destructive"
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/credentials"
        className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        Manage credentials
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  )
}

export function DashboardOverview({
  name,
  data,
}: {
  name: string
  data: DashboardData
}) {
  return (
    <div className="relative space-y-6 overflow-hidden pb-8 sm:space-y-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.12),transparent_30%),linear-gradient(180deg,rgba(71,85,105,0.08),transparent_78%)]" />

      <DashboardHero name={name} data={data} />
      <PortfolioStats data={data} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <div className="space-y-6">
          <NextActions actions={data.actions} />
          <RecentWork data={data} />
        </div>
        <aside className="space-y-6">
          <ProfileReadiness data={data} />
          <CredentialHealth data={data} />
        </aside>
      </div>
    </div>
  )
}
