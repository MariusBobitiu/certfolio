export const SKILL_CATEGORIES = [
  "technical",
  "tools",
  "domain",
  "professional",
] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: "Technical",
  tools: "Tools & technologies",
  domain: "Domain knowledge",
  professional: "Professional",
}
