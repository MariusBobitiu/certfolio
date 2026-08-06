import { CustomBadge } from "@/components/projects/custom-badge"
import { ProjectCardPreview } from "@/components/projects/project-card-preview"
import { elenaProjects } from "@/data/landing-seed"

export function EvidenceSection() {
  const project = elenaProjects[0]

  return (
    <section className="bg-secondary/30 px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Projects & evidence
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            Do not just say you built it. Show the work.
          </h2>
        </div>

        {/* Full-width project case study — using real ProjectCardPreview listing variant */}
        <ProjectCardPreview
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

        {/* Context + Outcome detail section */}
        <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/30 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Context</p>
              <p className="mt-1 text-sm leading-6 text-foreground/80">{project.context}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Outcome</p>
              <p className="mt-1 text-sm leading-6 text-foreground/80">{project.outcome}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <CustomBadge label="Type" value={project.projectType} />
            <CustomBadge label="Role" value={project.role} />
          </div>
        </div>
      </div>
    </section>
  )
}
