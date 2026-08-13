"use client"

import { useCallback, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { ProfileAboutLinksSection } from "@/components/profile/profile-about-links-section"
import { ProfileBottomBar } from "@/components/profile/profile-bottom-bar"
import { ProfileFeaturedCredentials } from "@/components/profile/profile-featured-credentials"
import { ProfileFeaturedProjects } from "@/components/profile/profile-featured-projects"
import { ProfileIdentitySurface } from "@/components/profile/profile-identity-surface"
import {
  saveProfile,
  uploadProfileImageAction,
  type ProfileManagementData,
} from "@/data/profile-management"
import {
  profileFormSchema,
  type ProfileFormData,
} from "@/lib/validations/profile"

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

type ProfileWorkspaceProps = {
  data: ProfileManagementData
}

export function ProfileWorkspace({ data }: ProfileWorkspaceProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null)
  const [featuredCredIds, setFeaturedCredIds] = useState<string[]>(
    data.preferences.featured_credential_ids
  )
  const [featuredProjIds, setFeaturedProjIds] = useState<string[]>(
    data.preferences.featured_project_ids
  )
  const [isSaving, setIsSaving] = useState(false)

  const [committedCredIds, setCommittedCredIds] = useState<string[]>(
    data.preferences.featured_credential_ids
  )
  const [committedProjIds, setCommittedProjIds] = useState<string[]>(
    data.preferences.featured_project_ids
  )

  const form = useForm<ProfileFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileFormSchema as any) as any,
    defaultValues: {
      name: data.user.name,
      slug: data.user.slug,
      headline: data.preferences.headline,
      bio: data.preferences.bio,
      links: data.links.map((l) => ({
        id: l.id,
        platform:
          l.platform as import("@/lib/validations/profile").LinkPlatform,
        label: l.label,
        url: l.url,
      })),
    },
  })

  const formDirty = form.formState.isDirty
  const featuredDirty =
    !arraysEqual(featuredCredIds, committedCredIds) ||
    !arraysEqual(featuredProjIds, committedProjIds)
  const isDirty = formDirty || imageFile !== null || featuredDirty

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file)
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const formData = form.getValues()

      let imageUrl: string | null = null
      let imageKey: string | null = null
      if (imageFile) {
        const result = await uploadProfileImageAction(data.user.id, imageFile)
        imageUrl = result.imageUrl
        imageKey = result.imageKey
      }

      await saveProfile(data.user.id, {
        ...formData,
        imageKey,
        imageUrl,
        featuredCredentialIds: featuredCredIds,
        featuredProjectIds: featuredProjIds,
      })

      form.reset(formData)
      if (imageUrl) {
        setSavedImageUrl(imageUrl)
      }
      setImageFile(null)
      setImagePreview(null)
      setCommittedCredIds(featuredCredIds)
      setCommittedProjIds(featuredProjIds)

      toast.success("Profile saved")
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [form, imageFile, featuredCredIds, featuredProjIds, data.user.id])

  const watchedValues = form.watch()
  const currentImageUrl = savedImageUrl ?? data.user.image
  const hasImage = !!(imagePreview || currentImageUrl)
  const hasHeadline = !!watchedValues.headline?.trim()
  const hasBio = !!watchedValues.bio?.trim()
  const hasLinks = (watchedValues.links?.length ?? 0) > 0

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-12">
        {/* Unified identity surface — includes visibility + accent */}
        <ProfileIdentitySurface
          currentImageUrl={currentImageUrl || null}
          previewUrl={imagePreview}
          onImageSelectAction={handleImageSelect}
          userId={data.user.id}
          initialSlug={data.user.slug}
          isDirty={isDirty}
          isSaving={isSaving}
          onSaveAction={handleSave}
          publicSlug={data.user.slug}
          isPublic={data.preferences.public_profile}
          accentColour={data.preferences.accent_colour}
          hasImage={hasImage}
          hasHeadline={hasHeadline}
          hasBio={hasBio}
          hasLinks={hasLinks}
          featuredCredsCount={featuredCredIds.length}
          featuredProjectsCount={featuredProjIds.length}
        />

        {/* About & links */}
        <ProfileAboutLinksSection />

        {/* Featured credentials */}
        <ProfileFeaturedCredentials
          credentials={data.publishedCredentials}
          selectedIds={featuredCredIds}
          onChangeAction={setFeaturedCredIds}
        />

        {/* Featured projects */}
        <ProfileFeaturedProjects
          projects={data.publishedProjects}
          selectedIds={featuredProjIds}
          onChangeAction={setFeaturedProjIds}
        />

        {/* Bottom bar — mobile only */}
        <ProfileBottomBar
          isDirty={isDirty}
          isSaving={isSaving}
          onSaveAction={handleSave}
          publicSlug={data.user.slug}
        />
      </div>
    </FormProvider>
  )
}
