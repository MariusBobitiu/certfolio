import { ShieldQuestion } from "lucide-react"

import type { PublicSkill } from "@/data/profile"
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "@/lib/skills"

import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileSkillsSection({ skills }: { skills: PublicSkill[] }) {
  if (skills.length === 0) return null

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        label="Self-declared skills"
        subtitle={`${skills.length} ${skills.length === 1 ? "capability" : "capabilities"} selected by the profile owner`}
      />
      <div className="flex flex-wrap gap-2.5">
        {skills.map((skill) => {
          const category = skill.category as SkillCategory
          const categoryLabel = SKILL_CATEGORY_LABELS[category] ?? "Skill"

          return (
            <div
              key={skill.id}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2.5 shadow-xs dark:border-white/8"
            >
              <ShieldQuestion className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {skill.name}
              </span>
              <span className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {categoryLabel}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
