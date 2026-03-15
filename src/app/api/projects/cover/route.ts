import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import { db, ProjectsTable } from "@/lib/db/drizzle"
import { uploadProjectCoverImage } from "@/lib/storage/r2"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const projectSlug = formData.get("projectSlug")

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Image file is required" },
      { status: 400 }
    )
  }

  if (typeof projectSlug !== "string" || projectSlug.trim().length === 0) {
    return NextResponse.json(
      { error: "Project slug is required" },
      { status: 400 }
    )
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image uploads are supported" },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Cover image must be smaller than 5MB" },
      { status: 400 }
    )
  }

  const [project] = await db
    .select({ id: ProjectsTable.id })
    .from(ProjectsTable)
    .where(
      and(
        eq(ProjectsTable.user_id, session.user.id),
        eq(ProjectsTable.slug, projectSlug.trim())
      )
    )
    .limit(1)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const uploaded = await uploadProjectCoverImage({
    userId: session.user.id,
    projectSlug: projectSlug.trim(),
    file,
  })

  await db
    .update(ProjectsTable)
    .set({
      cover_image_key: uploaded.key,
      updated_at: new Date(),
    })
    .where(eq(ProjectsTable.id, project.id))

  return NextResponse.json({
    key: uploaded.key,
    url: uploaded.url,
  })
}
