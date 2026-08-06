import { Github, FileText, Linkedin, Globe, ShieldCheck } from "lucide-react"
import { elena } from "@/data/landing-seed"

const fragments = [
  { icon: Github, label: "GitHub", sub: "Repositories" },
  { icon: FileText, label: "Credential PDFs", sub: "Portal downloads" },
  { icon: Linkedin, label: "LinkedIn", sub: "List of roles" },
  { icon: Globe, label: "Personal site", sub: "Separate portfolio" },
] as const

export function ProblemSection() {
  return (
    <section className="bg-linear-to-b from-background via-background to-secondary px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            The problem
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            Your professional identity is scattered.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Certifications, code, experience and project context each live in
            separate places. No single view tells the full story.
          </p>
        </div>

        {/* Convergence diagram */}
        <div className="relative mx-auto max-w-4xl">
          {/* Fragmented sources row */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fragments.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card p-4 text-center transition-colors hover:border-border"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connector lines */}
          <div className="mb-8 flex items-center justify-center">
            <svg
              className="h-12 w-full max-w-md"
              viewBox="0 0 400 48"
              fill="none"
            >
              {/* Left two converge */}
              <path
                d="M80 0 C80 24, 180 24, 200 48"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/50"
              />
              <path
                d="M160 0 C160 24, 180 24, 200 48"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/50"
              />
              {/* Right two converge */}
              <path
                d="M240 0 C240 24, 220 24, 200 48"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/50"
              />
              <path
                d="M320 0 C320 24, 220 24, 200 48"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/50"
              />
              {/* Center dot */}
              <circle cx="200" cy="48" r="3" className="fill-primary/40" />
            </svg>
          </div>

          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-border" />
            <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Scattered claims become structured evidence
            </span>
            <div className="h-px w-8 bg-border" />
          </div>

          {/* Converged profile — strong single card */}
          <div className="overflow-hidden rounded-4xl border border-border bg-card shadow-sm">
            <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between sm:px-8 sm:py-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary shadow-sm ring-1 ring-primary/20">
                  EM
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {elena.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{elena.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:gap-5">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-300" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-300">
                    2 verified
                  </span>
                </span>
                <span>3 credentials</span>
                <span>3 projects</span>
                <span>5 evidence links</span>
              </div>
            </div>
            <div className="border-t border-border/70 bg-secondary/30 px-6 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                One Certfolio profile — identity, credentials, projects and
                evidence in one place
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
