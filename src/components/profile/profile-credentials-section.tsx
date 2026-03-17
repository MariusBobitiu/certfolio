import type { PublicCredential } from "@/data/profile"
import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"
import { ProfileSectionHeader } from "./profile-section-header"

export function ProfileCredentialsSection({
  credentials,
}: {
  credentials: PublicCredential[]
}) {
  if (credentials.length === 0) return null

  return (
    <section className="space-y-5">
      <ProfileSectionHeader label="Credentials" count={credentials.length} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {credentials.map((credential) => (
          <CredentialCardPreview
            key={credential.id}
            issuerDisplayName={credential.issuer.display_name}
            issuerThemeKey={credential.issuer.theme_key}
            title={credential.title}
            issuedOn={credential.issued_on.toISOString()}
            verificationStatus={credential.verification_status}
          />
        ))}
      </div>
    </section>
  )
}
