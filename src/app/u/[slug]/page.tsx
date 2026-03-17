import { Lock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getPublicProfileData } from "@/data/profile"
import { ProfileAboutSection } from "@/components/profile/profile-about-section"
import { ProfileCredentialsSection } from "@/components/profile/profile-credentials-section"
import { ProfileCtaSection } from "@/components/profile/profile-cta-section"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ProfileProjectsSection } from "@/components/profile/profile-projects-section"
import { ProfileVerificationBar } from "@/components/profile/profile-verification-bar"

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params
  const data = await getPublicProfileData(slug)

  if (!data) notFound()

  // Minimal Certfolio wordmark shown on all states
  const brandmark = (
    <div className="flex justify-center pb-12">
      <Link
        href="/"
        className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-opacity hover:opacity-70"
      >
        Certfolio
      </Link>
    </div>
  )

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

  const { user, preferences, credentials, projects } = data
  const hasContent = credentials.length > 0 || projects.length > 0

  return (
    <main className="min-h-dvh bg-background">
      {/* Top brandmark */}
      <div className="flex justify-center pt-8 pb-0">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-opacity hover:opacity-70"
        >
          Certfolio
        </Link>
      </div>

      {/* Profile content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-14">
          {/* Hero */}
          <ProfileHero name={user.name} image={user.image} slug={user.slug} />

          {/* Trust summary */}
          <ProfileVerificationBar
            credentials={credentials}
            projectCount={projects.length}
          />

          {/* About */}
          <ProfileAboutSection bio={preferences.bio} />

          {/* Empty state when no public content */}
          {!hasContent && (
            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-6 py-10 text-center dark:border-white/8 dark:bg-white/3">
              <p className="text-sm text-muted-foreground">
                No public credentials or projects yet.
              </p>
            </div>
          )}

          {/* Credentials */}
          <ProfileCredentialsSection credentials={credentials} />

          {/* Projects */}
          <ProfileProjectsSection projects={projects} />

          {/* CTA */}
          <ProfileCtaSection
            email={user.email}
            showEmail={preferences.show_email}
          />
        </div>
      </div>

      {/* Bottom brandmark */}
      {brandmark}
    </main>
  )
}
