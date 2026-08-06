import { ShieldCheck } from "lucide-react"
import { LandingProfilePreview } from "@/components/landing/landing-profile-preview"

export function ProductDemo() {
  return (
    <section id="product" className="bg-background px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-20">
          {/* Left: heading + supporting copy */}
          <div className="flex flex-col justify-center lg:sticky lg:top-24">
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              The product
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              One profile. A clearer professional story.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Certfolio brings your credentials, skills, projects and professional
              links into one structured profile. Every credential and project
              carries evidence — not just claims.
            </p>

            {/* Feature highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Verified credentials</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Independently confirmed credentials are clearly marked, so
                    visitors can distinguish verified achievements from
                    self-declared records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Evidence-backed projects</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Each project carries linked evidence, context and measurable
                    outcomes — not just a title and a screenshot.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <ShieldCheck className="size-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Public visibility control</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    You decide when your profile is visible. Toggle between public
                    and private at any time from a single control.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Cropped profile preview */}
          <div className="relative max-h-145 overflow-hidden rounded-3xl">
            <LandingProfilePreview />
            {/* Gradient fade at bottom to indicate cropped content */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-secondary/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
