import type { PublicCredential } from "@/data/profile"
import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"
import { ProfileSectionHeader } from "./profile-section-header"

const TIER_ORDER = {
  verified_external: 0,
  linked_external: 1,
  self_declared: 2,
} as const

function buildCredentialSubtitle(credentials: PublicCredential[]): string {
  const total = credentials.length
  const verifiedCount = credentials.filter(
    (c) => c.verification_status === "verified_external"
  ).length
  const label = total === 1 ? "credential" : "credentials"
  if (verifiedCount === 0) return `${total} ${label}`
  const verifiedLabel =
    verifiedCount === 1
      ? "1 independently verified"
      : `${verifiedCount} independently verified`
  return `${total} ${label} · ${verifiedLabel}`
}

export function ProfileCredentialsSection({
  credentials,
}: {
  credentials: PublicCredential[]
}) {
  if (credentials.length === 0) return null

  const sorted = [...credentials].sort(
    (a, b) =>
      TIER_ORDER[a.verification_status] - TIER_ORDER[b.verification_status]
  )

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        label="Credentials"
        subtitle={buildCredentialSubtitle(credentials)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((credential) => (
          <CredentialCardPreview
            key={credential.id}
            issuerDisplayName={credential.issuer.display_name}
            issuerThemeKey={credential.issuer.theme_key}
            issuerLogoUrl={credential.issuer.logo_url}
            title={credential.title}
            issuedOn={credential.issued_on.toISOString()}
            verificationStatus={credential.verification_status}
          />
        ))}
      </div>
    </section>
  )
}
