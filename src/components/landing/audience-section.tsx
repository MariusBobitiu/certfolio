import { GraduationCap, Cpu, Users } from "lucide-react"
import { SkillTag } from "@/components/ui/skill-tag"
import { LandingCredentialPreview } from "@/components/landing/landing-credential-preview"
import { LandingProjectPreview } from "@/components/landing/landing-project-preview"
import { LandingCandidateSummary } from "@/components/landing/landing-candidate-summary"

const previewCardClasses =
  "h-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm dark:border-white/8"

const pathways = [
  {
    icon: GraduationCap,
    title: "Building a career",
    description:
      "For students, graduates and professionals entering new technical specialisms. Present what you know and what you have built — even when your work history is still growing.",
    fragment: (
      <div
        className={`${previewCardClasses} flex flex-col justify-between gap-4 p-4 sm:p-5`}
      >
        <div>
          {/* One compact credential preview */}
          <LandingCredentialPreview
            issuerDisplayName="Amazon Web Services"
            issuerThemeKey="aws"
            title="AWS Certified Solutions Architect — Professional"
            issuedOn="2024-03-15"
            verificationStatus="verified_external"
            className="shadow-none"
          />
        </div>
        {/* Four skill tags */}
        <div className="flex flex-wrap gap-1.5">
          <SkillTag label="AWS" />
          <SkillTag label="Azure" />
          <SkillTag label="Kubernetes" />
          <SkillTag label="Terraform" />
        </div>
      </div>
    ),
  },
  {
    icon: Cpu,
    title: "Demonstrating specialist work",
    description:
      "For developers, cloud engineers, cybersecurity professionals and technical consultants. Show the depth of your expertise through projects, evidence and verifiable credentials.",
    fragment: (
      <LandingProjectPreview
        title="Multi-cluster observability platform"
        summary="Unified monitoring across 12 EKS clusters. Mean time to detection dropped from 8 minutes to under 90 seconds."
        status="published"
        tools="Prometheus, Thanos, Grafana, Helm, Terraform"
        evidenceCount={3}
        className={previewCardClasses}
      />
    ),
  },
  {
    icon: Users,
    title: "Reviewing technical candidates",
    description:
      "For recruiters, hiring managers and potential clients who need clearer evidence of capability. Examine real projects, verified credentials and structured context.",
    fragment: (
      <LandingCandidateSummary
        verifiedCount={2}
        credentialCount={3}
        projectCount={3}
        evidenceCount={5}
        className={previewCardClasses}
      />
    ),
  },
]

export function AudienceSection() {
  return (
    <section
      id="audience"
      className="scroll-mt-16 bg-secondary/30 px-5 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Who it is for
        </p>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          Three ways Certfolio works.
        </h2>

        <div className="mt-14 grid items-stretch gap-12 lg:grid-cols-3 lg:gap-7">
          {pathways.map(({ icon: Icon, title, description, fragment }, i) => (
            <div key={title} className="group flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground tabular-nums">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mt-7 text-xl font-semibold tracking-[-0.03em] text-foreground">
                {title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <div className="mt-7 h-64">{fragment}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
