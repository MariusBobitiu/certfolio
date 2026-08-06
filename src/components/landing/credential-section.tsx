import { ShieldCheck, Info } from "lucide-react"
import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"

export function CredentialSection() {
  return (
    <section className="bg-background px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-5xl">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Credentials
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            Trust where it matters. Context where it helps.
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Certfolio distinguishes independently verified credentials from
            user-supplied records, so visitors can understand the level of trust
            behind each achievement.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CredentialCardPreview
            issuerDisplayName="Amazon Web Services"
            issuerThemeKey="aws"
            title="AWS Certified Solutions Architect — Professional"
            issuedOn="2024-03-15"
            verificationStatus="verified_external"
          />

          <CredentialCardPreview
            issuerDisplayName="Microsoft"
            issuerThemeKey="microsoft"
            title="Microsoft Certified: Azure Administrator Associate"
            issuedOn="2024-02-10"
            verificationStatus="verified_external"
          />

          <CredentialCardPreview
            issuerDisplayName="The Linux Foundation"
            issuerThemeKey="linux-foundation"
            title="Certified Kubernetes Application Developer"
            issuedOn="2024-01-20"
            verificationStatus="self_declared"
          />
        </div>

        <div className="mx-auto mt-10 max-w-5xl grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-500/20">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Verified credentials
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Linked to an issuer or validation source and clearly marked as
                independently confirmed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Info className="size-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Self-declared credentials
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Useful for recording professional learning, while remaining
                visibly distinguished from verified achievements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
