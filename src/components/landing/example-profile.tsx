import Link from "next/link"
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"
import { ProjectCardPreview } from "@/components/projects/project-card-preview"
import { SkillTag } from "@/components/ui/skill-tag"
import { elena, elenaCredentials, elenaSkills, elenaProjects, elenaLinks } from "@/data/landing-seed"
import { Github, Linkedin, Globe } from "lucide-react"

const linkIcons = { github: Github, linkedin: Linkedin, website: Globe } as const

export function ExampleProfile() {
  const verifiedCount = elenaCredentials.filter(c => c.verificationStatus === "verified_external").length
  const evidenceCount = elenaProjects.reduce((t, p) => t + p.evidenceCount, 0)

  return (
    <section id="example" className="bg-background px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Example profile</p>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            See what a complete professional profile looks like.
          </h2>
        </div>

        {/* Real public profile surface — matching u/[slug]/page.tsx */}
        <div className="overflow-hidden rounded-4xl border border-border bg-card shadow-md">
          <div className="h-1 bg-linear-to-r from-primary via-primary/70 to-primary/30" />
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">

            {/* Hero card — matching real profile hero */}
            <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/66 to-transparent" />
              <div className="absolute right-0 bottom-0 h-32 w-32 rounded-full blur-3xl bg-primary/8" />
              <div className="absolute top-8 right-8 hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-primary uppercase lg:inline-flex">
                Independently verifiable work
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                  <Sparkles className="size-3.5 text-primary" />
                  Certfolio public profile
                </div>

                {/* ProfileHero */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <div className="flex size-22 shrink-0 items-center justify-center rounded-3xl border border-border bg-linear-to-br from-primary/15 via-secondary to-card text-2xl font-semibold tracking-[-0.04em] text-foreground shadow-sm ring-1 ring-primary/20 sm:size-24">
                    {elena.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="space-y-2.5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                      <ShieldCheck className="size-3.5" />Proof-backed profile
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">{elena.name}</h3>
                      <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">@{elena.slug}</p>
                    </div>
                    <p className="max-w-2xl text-base leading-7 text-foreground/80">{elena.headline}</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {verifiedCount} independently verified credentials · {elenaProjects.length} projects
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bio — real ProfileAboutSection style */}
            <div>
              <p className="max-w-2xl text-[17px] leading-[1.75] text-foreground/85">{elena.bio}</p>
            </div>

            {/* Links — matching real profile links row */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold tracking-[-0.02em] text-muted-foreground uppercase">Links</h4>
              <div className="flex flex-wrap gap-2">
                {elenaLinks.map((link) => {
                  const Icon = linkIcons[link.platform]
                  return (
                    <span
                      key={link.platform}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm font-medium text-foreground"
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{link.label}</span>
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Credentials — real CredentialCardPreview grid */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold tracking-[-0.02em] text-foreground">Credentials</h4>
                <p className="text-sm text-muted-foreground">{elenaCredentials.length} credentials · {verifiedCount} independently verified</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {elenaCredentials.map(cred => (
                  <CredentialCardPreview
                    key={cred.id}
                    issuerDisplayName={cred.issuerDisplayName}
                    issuerThemeKey={cred.issuerThemeKey}
                    title={cred.title}
                    issuedOn={cred.issuedOn}
                    verificationStatus={cred.verificationStatus}
                  />
                ))}
              </div>
            </div>

            {/* Skills — real SkillTag components */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold tracking-[-0.02em] text-foreground">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {elenaSkills.map(skill => (
                  <SkillTag key={skill} label={skill} />
                ))}
              </div>
            </div>

            {/* Projects — real ProjectCardPreview with listing variant */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold tracking-[-0.02em] text-foreground">Projects</h4>
                <p className="text-sm text-muted-foreground">{elenaProjects.length} published projects · {evidenceCount} evidence links</p>
              </div>
              <div className="space-y-4">
                {elenaProjects.map(project => (
                  <ProjectCardPreview
                    key={project.id}
                    eyebrow=""
                    title={project.title}
                    summary={project.summary}
                    coverImageUrl={null}
                    projectType={project.projectType}
                    role={project.role}
                    status="published"
                    context={project.context}
                    outcome={project.outcome}
                    tools={project.tools}
                    evidenceCount={project.evidenceCount}
                    variant="listing"
                  />
                ))}
              </div>
            </div>

            {/* CTA — matches ProfileCtaSection */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Open to opportunities</p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4">
                contact@elenamarin.dev
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/sign-up" className="gap-1.5">
              Create your profile<ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
