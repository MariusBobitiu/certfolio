import Image from "next/image"
import { BadgeCheck, BriefcaseBusiness, Link2, ShieldCheck } from "lucide-react"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileHero({
  name,
  image,
  slug,
  tagline,
  trustLine,
  verifiedCount = 0,
  credentialCount = 0,
  projectCount = 0,
  evidenceCount = 0,
}: {
  name: string
  image: string
  slug: string
  tagline?: string
  trustLine?: string
  verifiedCount?: number
  credentialCount?: number
  projectCount?: number
  evidenceCount?: number
}) {
  const hasImage = Boolean(image)
  const stats = [
    {
      label: "Verified",
      value: verifiedCount,
      Icon: ShieldCheck,
    },
    {
      label: "Credentials",
      value: credentialCount,
      Icon: BadgeCheck,
    },
    {
      label: "Projects",
      value: projectCount,
      Icon: BriefcaseBusiness,
    },
    {
      label: "Evidence",
      value: evidenceCount,
      Icon: Link2,
    },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0">
          {hasImage ? (
            <Image
              unoptimized
              src={image}
              alt={name}
              width={112}
              height={112}
              className="size-24 rounded-3xl border border-border object-cover shadow-sm ring-1 ring-primary/20 sm:size-28"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-3xl border border-border bg-linear-to-br from-primary/15 via-secondary to-card text-2xl font-semibold tracking-tight text-foreground shadow-sm ring-1 ring-primary/20 sm:size-28">
              {getInitials(name)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
            <ShieldCheck className="size-3.5" />
            Proof-backed profile
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">
              {name}
            </h1>
            <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
              @{slug}
            </p>
          </div>

          {tagline && (
            <p className="max-w-2xl text-base leading-7 text-foreground/80">
              {tagline}
            </p>
          )}

          {trustLine && (
            <p className="text-sm font-medium text-muted-foreground">
              {trustLine}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-secondary/30 p-4"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              <Icon className="size-3.5" />
              {label}
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
