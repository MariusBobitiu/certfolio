import type { PublicProject } from "@/data/profile"
import { ProjectCardPreview } from "@/components/projects/project-card-preview"
import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileProjectsSection({
  projects,
}: {
  projects: PublicProject[]
}) {
  if (projects.length === 0) return null

  return (
    <section className="space-y-5">
      <ProfileSectionHeader label="Projects" count={projects.length} />
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <ProjectCardPreview
            key={project.id}
            eyebrow="Project"
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
          />
        ))}
      </div>
    </section>
  )
}
