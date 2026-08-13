import { Lock, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getPublicProfileData } from "@/data/profile"
import { ProfileAboutSection } from "@/components/profile/profile-about-section"
import { ProfileContactSection } from "@/components/profile/profile-contact-section"
import { ProfileCredentialsSection } from "@/components/profile/profile-credentials-section"
import { ProfileEvidenceSection } from "@/components/profile/profile-evidence-section"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ProfileProjectsSection } from "@/components/profile/profile-projects-section"
import { ProfileSkillsSection } from "@/components/profile/profile-skills-section"

export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

const brandmark = (
  <div className="flex justify-center py-8">
    <Link
      href="/"
      className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-opacity hover:opacity-70"
    >
      Certfolio
    </Link>
  </div>
)

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params
  const data = await getPublicProfileData(slug)

  if (!data) notFound()

  if (data.isPrivate) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-secondary/60 dark:border-white/10 dark:bg-white/6">
            <Lock className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              {data.user.name}&apos;s profile is private
            </h1>
            <p className="text-sm text-muted-foreground">
              This profile is not publicly visible.
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to Certfolio
          </Link>
        </div>
      </main>
    )
  }

  const { user, preferences, links, skills, credentials, projects } = data
  const accentColour = preferences.accent_colour ?? "#3b82f6"
  const hasContent =
    credentials.length > 0 || skills.length > 0 || projects.length > 0
  const evidenceCount = projects.reduce(
    (total, project) => total + project.evidence.length,
    0
  )

  const tagline = preferences.headline?.trim() || undefined

  const verifiedCount = credentials.filter(
    (c) => c.verification_status === "verified_external"
  ).length
  const trustLineParts: string[] = []
  if (verifiedCount > 0) {
    trustLineParts.push(
      `${verifiedCount} independently verified credential${verifiedCount === 1 ? "" : "s"}`
    )
  } else if (credentials.length > 0) {
    trustLineParts.push(
      `${credentials.length} credential${credentials.length === 1 ? "" : "s"}`
    )
  }
  if (projects.length > 0) {
    trustLineParts.push(
      `${projects.length} project${projects.length === 1 ? "" : "s"}`
    )
  }
  const trustLine =
    trustLineParts.length > 0 ? trustLineParts.join(" · ") : undefined

  return (
    <main className="min-h-dvh overflow-hidden bg-background">
      <div className="relative isolate">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-80"
          style={{
            background: `linear-gradient(to bottom, ${accentColour}18, ${accentColour}08, transparent)`,
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="flex items-center justify-between rounded-full border border-border bg-card/80 px-4 py-3">
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.34em] text-foreground uppercase transition-opacity hover:opacity-70"
            >
              Certfolio
            </Link>
            <div
              className="hidden items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase sm:inline-flex"
              style={{ color: accentColour }}
            >
              <ShieldCheck
                className="size-3.5"
                style={{ color: accentColour }}
              />
              Public proof profile
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6">
          <div className="space-y-10">
            <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-6 sm:p-8">
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${accentColour}66, transparent)`,
                }}
              />
              <div
                className="absolute right-0 bottom-0 h-48 w-48 rounded-full blur-3xl"
                style={{ backgroundColor: `${accentColour}18` }}
              />
              <div
                className="absolute top-10 right-10 hidden rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase lg:inline-flex"
                style={{
                  borderColor: `${accentColour}33`,
                  backgroundColor: `${accentColour}1a`,
                  color: accentColour,
                }}
              >
                Independently verifiable work
              </div>

              <div className="space-y-8">
                <div
                  className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase"
                  style={{ color: accentColour }}
                >
                  <Sparkles
                    className="size-3.5"
                    style={{ color: accentColour }}
                  />
                  Certfolio public profile
                </div>

                <ProfileHero
                  name={user.name}
                  image={user.image}
                  slug={user.slug}
                  tagline={tagline}
                  trustLine={trustLine}
                  verifiedCount={verifiedCount}
                  credentialCount={credentials.length}
                  projectCount={projects.length}
                  evidenceCount={evidenceCount}
                />
              </div>
            </section>

            <ProfileAboutSection bio={preferences.bio} />

            <ProfileCredentialsSection credentials={credentials} />

            <ProfileSkillsSection skills={skills} />

            {!hasContent && (
              <div className="rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  This Certfolio profile is live, but no public proof has been
                  published yet.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Public credentials and evidence-backed projects will appear
                  here once they are ready.
                </p>
              </div>
            )}

            <ProfileProjectsSection
              projects={projects}
              profileSlug={user.slug}
            />

            <ProfileEvidenceSection projects={projects} />

            <ProfileContactSection
              email={user.email}
              showEmail={preferences.show_email}
              links={links}
            />
          </div>
        </div>
      </div>

      {brandmark}
    </main>
  )
}
