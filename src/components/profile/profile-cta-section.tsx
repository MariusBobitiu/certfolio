import { Mail } from "lucide-react"

export function ProfileCtaSection({
  email,
  showEmail,
}: {
  email: string
  showEmail: boolean
}) {
  if (!showEmail) return null

  return (
    <section className="rounded-2xl border border-border/60 bg-linear-to-br from-secondary/40 via-card to-primary/5 px-6 py-6 dark:border-white/8 dark:from-secondary/20 dark:via-card/30 dark:to-primary/8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">
            Get in touch
          </h2>
          <p className="text-sm text-muted-foreground">
            Interested in working together? Reach out directly.
          </p>
        </div>
        <a
          href={`mailto:${email}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60 dark:border-white/10 dark:bg-white/4 dark:hover:bg-white/8"
        >
          <Mail className="size-4" />
          {email}
        </a>
      </div>
    </section>
  )
}
