import * as z from "zod/v4"

import { SKILL_CATEGORIES } from "@/lib/skills"

const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(60, "Keep skill names under 60 characters"),
  category: z.enum(SKILL_CATEGORIES),
})

export const saveSkillsSchema = z
  .object({
    skills: z.array(skillSchema).max(30, "You can add up to 30 skills"),
  })
  .superRefine(({ skills }, context) => {
    const seen = new Set<string>()

    skills.forEach((skill, index) => {
      const normalized = skill.name.trim().toLocaleLowerCase()
      if (seen.has(normalized)) {
        context.addIssue({
          code: "custom",
          message: "Each skill must be unique",
          path: ["skills", index, "name"],
        })
      }
      seen.add(normalized)
    })
  })

export type SaveSkillsInput = z.input<typeof saveSkillsSchema>
