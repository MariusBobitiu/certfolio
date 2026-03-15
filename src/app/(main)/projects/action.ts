"use server"

import { and, eq } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import { db, ProjectsTable } from "@/lib/db/drizzle"
import { actionClient } from "@/lib/safe-action"

import { createProjectSchema, updateProjectSchema } from "./schema"

function slugifyProjectTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

async function generateUniqueProjectSlug(userId: string, title: string) {
  const baseSlug = slugifyProjectTitle(title) || "project"
  let candidateSlug = baseSlug
  let suffix = 1

  while (true) {
    const [existingProject] = await db
      .select({ id: ProjectsTable.id })
      .from(ProjectsTable)
      .where(
        and(
          eq(ProjectsTable.user_id, userId),
          eq(ProjectsTable.slug, candidateSlug)
        )
      )
      .limit(1)

    if (!existingProject) {
      return candidateSlug
    }

    suffix += 1
    candidateSlug = `${baseSlug}-${suffix}`
  }
}

export const createProjectAction = actionClient
  .inputSchema(createProjectSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) {
      return { failure: "Unauthorized" }
    }

    const title = parsedInput.title.trim()
    const projectType = parsedInput.projectType.trim()
    const role = parsedInput.role.trim()
    const summary = parsedInput.summary.trim()
    const context = parsedInput.context.trim()
    const outcome = parsedInput.outcome.trim()
    const tools = parsedInput.tools.trim()
    const slug = await generateUniqueProjectSlug(session.user.id, title)

    const [project] = await db
      .insert(ProjectsTable)
      .values({
        user_id: session.user.id,
        slug,
        title,
        project_type: projectType,
        role,
        summary,
        context,
        outcome,
        tools,
        status: "draft",
        updated_at: new Date(),
      })
      .returning()

    return { success: "Project created", project }
  })

export const updateProjectAction = actionClient
  .inputSchema(updateProjectSchema)
  .action(async ({ parsedInput }) => {
    const session = await getCurrentSession()
    if (!session) {
      return { failure: "Unauthorized" }
    }

    const [existingProject] = await db
      .select({ id: ProjectsTable.id })
      .from(ProjectsTable)
      .where(
        and(
          eq(ProjectsTable.user_id, session.user.id),
          eq(ProjectsTable.slug, parsedInput.slug)
        )
      )
      .limit(1)

    if (!existingProject) {
      return { failure: "Project not found" }
    }

    const [project] = await db
      .update(ProjectsTable)
      .set({
        title: parsedInput.title.trim(),
        project_type: parsedInput.projectType.trim(),
        role: parsedInput.role.trim(),
        summary: parsedInput.summary.trim(),
        context: parsedInput.context.trim(),
        outcome: parsedInput.outcome.trim(),
        tools: parsedInput.tools.trim(),
        status: parsedInput.status,
        updated_at: new Date(),
      })
      .where(eq(ProjectsTable.id, existingProject.id))
      .returning()

    return { success: "Project updated", project }
  })
