export function ProfileAboutSection({ bio }: { bio: string }) {
  if (!bio || bio.trim() === "") return null

  return (
    <section>
      <p className="max-w-2xl text-[17px] leading-[1.75] text-foreground/85">
        {bio}
      </p>
    </section>
  )
}
