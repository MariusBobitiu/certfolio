import { Metadata } from "next"
import Link from "next/link"
import { BriefcaseBusiness, FolderKanban, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard - Certfolio",
  description:
    "Your Certfolio dashboard for managing credentials, projects, and your professional identity workspace.",
  authors: [
    {
      name: "Marius Bobitiu",
      url: "https://mariusbobitiu.dev",
    },
  ],
}

const dashboardSections = [
  {
    title: "Credentials",
    description:
      "Manage verified credentials, profile records, and issuer-led presentation in one workspace.",
    href: "/credentials",
    Icon: ShieldCheck,
  },
  {
    title: "Projects",
    description:
      "Shape the project work that gives your credentials and experience real context.",
    href: "/projects",
    Icon: FolderKanban,
  },
  {
    title: "Profile",
    description:
      "Keep your overall professional identity clear, current, and ready to present.",
    href: "/settings",
    Icon: BriefcaseBusiness,
  },
] as const

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/40 px-6 py-8 shadow-md sm:px-8 dark:border-white/8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Overview
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Bring your credentials and work into one professional identity.
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Certfolio is built around structured credentials, real project
            context, and a cleaner way to present what you have done and how it
            is supported.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dashboardSections.map(({ title, description, href, Icon }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md transition-colors hover:border-border dark:border-white/8"
          >
            <div className="space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-background/80 dark:border-white/8 dark:bg-white/4">
                <Icon className="size-5 text-foreground/80" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  {title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                Open workspace
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
