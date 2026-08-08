import Image from "next/image"
import { Mail } from "lucide-react"

import type { PublicLink } from "@/data/profile"
import { PLATFORM_ICONS, type LinkPlatform } from "@/lib/validations/profile"

import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileContactSection({
  email,
  showEmail,
  links,
}: {
  email: string
  showEmail: boolean
  links: PublicLink[]
}) {
  if (!showEmail && links.length === 0) return null

  return (
    <section className="space-y-5 border-t border-border/70 pt-8">
      <ProfileSectionHeader
        label="Contact / external links"
        subtitle="Continue the conversation or explore more of this profile owner's work."
      />
      <div className="flex flex-wrap gap-2.5">
        {showEmail ? (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-secondary"
          >
            <Mail className="size-4" />
            {email}
          </a>
        ) : null}
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
          >
            <Image
              src={PLATFORM_ICONS[link.platform as LinkPlatform]}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
