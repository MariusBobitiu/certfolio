import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EvidenceProfileIllustration } from "@/components/landing/evidence-profile-illustration"

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[75vh] overflow-hidden">
      {/* ========== Layered background ========== */}

      {/* Base radial gradient — theme-aware, soft directional light from top-right */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(
              ellipse 60% 55% at 65% 40%,
              var(--color-secondary),
              transparent 55%
            ),
            radial-gradient(
              ellipse 80% 45% at 50% 100%,
              var(--color-secondary),
              transparent 50%
            )
          `,
          opacity: 0.45,
        }}
      />

      {/* Fine technical grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-muted-foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-muted-foreground) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 65% 45%, black 25%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 65% 45%, black 25%, transparent 70%)",
        }}
      />

      {/* Top-left subtle accent glow */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 -z-10 size-64 rounded-full blur-3xl"
        style={{ backgroundColor: "oklch(0.5 0.134 242.749 / 0.06)" }}
      />

      {/* Bottom-right subtle accent glow */}
      {/*<div
        className="pointer-events-none absolute -right-10 -bottom-10 -z-10 size-80 rounded-full blur-3xl"
        style={{ backgroundColor: "oklch(0.5 0.134 242.749 / 0.04)" }}
      />*/}

      {/* ========== Content ========== */}

      <div className="mx-auto max-w-7xl px-5 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[55fr_45fr] lg:gap-16 xl:gap-20">
          {/* ========== Left: Typography ========== */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              PROFESSIONAL IDENTITY, WITH EVIDENCE
            </p>

            {/* Headline — largest editorial element */}
            <h1 className="mt-6 max-w-[18ch] text-[2.5rem] leading-[1.06] font-semibold tracking-[-0.04em] text-foreground sm:text-[3.25rem] lg:text-[3.5rem]">
              Your professional identity. Built from proof.
            </h1>

            {/* Supporting text */}
            <p className="mt-6 max-w-[38ch] text-base leading-7 text-muted-foreground sm:text-lg">
              Bring your credentials, technical skills and evidence-backed work
              together in one trusted professional profile.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up" className="gap-1.5">
                  Create your profile
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#product">Explore Certfolio</Link>
              </Button>
            </div>

            {/* Supporting line */}
            <p className="mt-5 text-xs text-muted-foreground">
              Free to create · Public visibility control · No portfolio coding
              required
            </p>
          </div>

          {/* ========== Right: Evidence-built identity illustration ========== */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative isolate w-full max-w-120">
              <div
                className="pointer-events-none absolute inset-[8%] -z-10 rounded-full opacity-80"
                style={{
                  background:
                    "radial-gradient(ellipse, color-mix(in oklch, var(--color-primary) 13%, var(--color-background)) 0%, color-mix(in oklch, var(--color-background) 40%, transparent) 58%, transparent 76%)",
                }}
              />
              <EvidenceProfileIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
