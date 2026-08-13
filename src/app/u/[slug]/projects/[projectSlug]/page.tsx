import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getPublicProjectData } from "@/data/profile"
import { PublicProjectCaseStudyPage } from "@/components/profile/public-project-case-study"

export const dynamic = "force-dynamic"

type PublicProjectPageProps = {
  params: Promise<{ slug: string; projectSlug: string }>
}

function getPublicBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000"
  )
}

export async function generateMetadata({
  params,
}: PublicProjectPageProps): Promise<Metadata> {
  const { slug, projectSlug } = await params
  const project = await getPublicProjectData({
    profileSlug: slug,
    projectSlug,
  })

  if (!project) {
    return {
      title: "Project not found | Certfolio",
    }
  }

  const url = new URL(
    `/u/${project.owner.slug}/projects/${project.slug}`,
    getPublicBaseUrl()
  )
  const title = `${project.title} — ${project.owner.name} | Certfolio`

  return {
    title,
    description: project.summary,
    alternates: {
      canonical: url.toString(),
    },
    openGraph: {
      title,
      description: project.summary,
      type: "article",
      url: url.toString(),
      siteName: "Certfolio",
      images: project.cover_image_url
        ? [
            {
              url: project.cover_image_url,
              alt: `${project.title} cover image`,
            },
          ]
        : undefined,
    },
  }
}

export default async function PublicProjectPage({
  params,
}: PublicProjectPageProps) {
  const { slug, projectSlug } = await params
  const project = await getPublicProjectData({
    profileSlug: slug,
    projectSlug,
  })

  if (!project) {
    notFound()
  }

  return <PublicProjectCaseStudyPage project={project} />
}
