import * as z from "zod/v4"

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Project title is required"),
  projectType: z.string().trim().min(1, "Project type is required"),
  role: z.string().trim().min(1, "Role is required"),
  summary: z.string().trim().min(1, "Project summary is required"),
})

export type CreateProjectInput = z.input<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.extend({
  slug: z.string().trim().min(1, "Project slug is required"),
  status: z.enum(["draft", "published", "archived"]),
})

export type UpdateProjectInput = z.input<typeof updateProjectSchema>
