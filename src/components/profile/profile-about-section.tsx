import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileAboutSection({ bio }: { bio: string }) {
  if (!bio || bio.trim() === "") return null

  return (
    <section className="space-y-4">
      <ProfileSectionHeader label="Professional summary" />
      <p className="max-w-3xl text-[17px] leading-[1.75] text-foreground/85">
        {bio}
      </p>
    </section>
  )
}
