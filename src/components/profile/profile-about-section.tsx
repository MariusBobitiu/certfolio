import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileAboutSection({ bio }: { bio: string }) {
  if (!bio || bio.trim() === "") return null

  return (
    <section className="space-y-4">
      <ProfileSectionHeader label="About" />
      <p className="max-w-2xl text-base leading-7 text-foreground/80">
        {bio}
      </p>
    </section>
  )
}
