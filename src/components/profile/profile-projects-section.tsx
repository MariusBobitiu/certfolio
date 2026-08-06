import type { Route } from "next"

import type { PublicProject } from "@/data/profile"
import { ProjectCardPreview } from "@/components/projects/project-card-preview"
import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileProjectsSection({
  projects,
  profileSlug,
}: {
  projects: PublicProject[]
  profileSlug: string
}) {
  if (projects.length === 0) return null

  const evidenceCount = projects.reduce(
    (total, project) => total + project.evidence.length,
    0
  )

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        label="Projects"
        subtitle={`${projects.length} published project${projects.length === 1 ? "" : "s"} · ${evidenceCount} evidence link${evidenceCount === 1 ? "" : "s"}`}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        {projects.map((project) => (
          <ProjectCardPreview
            key={project.id}
            eyebrow=""
            title={project.title}
            summary={project.summary}
            coverImageUrl={project.cover_image_url}
            projectType={project.project_type}
            role={project.role}
            status="published"
            context={project.context}
            outcome={project.outcome}
            tools={project.tools}
            evidenceCount={project.evidence.length}
            variant="listing"
            href={`/u/${profileSlug}/projects/${project.slug}` as Route}
          />
        ))}
      </div>
    </section>
  )
}
