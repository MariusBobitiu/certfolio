import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="bg-secondary/30 px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>

          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            Build a professional identity that can be examined, not just
            skimmed.
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Bring your credentials, skills and project evidence into one profile
            designed for technical work.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up" className="gap-1.5">
                Create your profile
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
