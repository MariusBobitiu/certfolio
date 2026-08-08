import { ExternalLink, Link2 } from "lucide-react"

import type { PublicProject } from "@/data/profile"

import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileEvidenceSection({
  projects,
}: {
  projects: PublicProject[]
}) {
  const evidence = projects.flatMap((project) =>
    project.evidence.map((link) => ({
      ...link,
      projectId: project.id,
      projectTitle: project.title,
    }))
  )

  if (evidence.length === 0) return null

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        label="Evidence links"
        subtitle={`${evidence.length} source${evidence.length === 1 ? "" : "s"} supporting the work above`}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {evidence.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30 dark:border-white/8"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Link2 className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{link.label}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {link.projectTitle} · {link.kind.replaceAll("_", " ")}
              </p>
            </div>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </a>
        ))}
      </div>
    </section>
  )
}
