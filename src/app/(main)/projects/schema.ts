import * as z from "zod/v4"

export const evidenceLinkSchema = z.object({
  label: z.string().trim().min(1, "Evidence label is required"),
  url: z.string().trim().url("Enter a valid URL"),
  kind: z.enum([
    "repository",
    "demo",
    "documentation",
    "write_up",
    "case_study",
    "other",
  ]),
})

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Project title is required"),
  projectType: z.string().trim().min(1, "Project type is required"),
  role: z.string().trim().min(1, "Role is required"),
  coverImageKey: z.string().trim().optional().default(""),
  summary: z.string().trim().min(1, "Project summary is required"),
  context: z.string().trim().optional().default(""),
  outcome: z.string().trim().optional().default(""),
  tools: z.string().trim().optional().default(""),
  evidenceLinks: z.array(evidenceLinkSchema).optional().default([]),
})

export type CreateProjectInput = z.input<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.extend({
  slug: z.string().trim().min(1, "Project slug is required"),
  status: z.enum(["draft", "published", "archived"]),
})

export type UpdateProjectInput = z.input<typeof updateProjectSchema>
