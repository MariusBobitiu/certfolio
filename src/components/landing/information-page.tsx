import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function InformationPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="px-5 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>

          <header className="mt-10">
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </header>

          <div className="mt-12 space-y-10 border-t border-border/70 pt-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InformationSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
      <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
