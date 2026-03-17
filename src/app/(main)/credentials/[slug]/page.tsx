import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { and, eq, or } from "drizzle-orm"
import { ChevronLeft } from "lucide-react"

import { CredentialDetailForm } from "./credential-detail-form"
import { getCurrentSession } from "@/lib/auth/session"
import { CredentialsTable, IssuersTable, db } from "@/lib/db/drizzle"
import { getCredentialAssetUrl } from "@/lib/storage/r2"

export default async function CredentialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getCurrentSession()
  if (!session) {
    redirect("/sign-in")
  }

  const { slug } = await params

  const [credential] = await db
    .select({
      slug: CredentialsTable.slug,
      title: CredentialsTable.title,
      sourceType: CredentialsTable.source_type,
      verificationStatus: CredentialsTable.verification_status,
      issuedOn: CredentialsTable.issued_on,
      expiresOn: CredentialsTable.expires_on,
      verificationUrl: CredentialsTable.verification_url,
      verificationCode: CredentialsTable.credential_code,
      certificateAssetKey: CredentialsTable.certificate_asset_key,
      summary: CredentialsTable.summary,
      status: CredentialsTable.status,
      issuerId: IssuersTable.id,
      issuerDisplayName: IssuersTable.display_name,
      issuerNormalizedName: IssuersTable.normalized_name,
      issuerAliases: IssuersTable.aliases,
      issuerKind: IssuersTable.kind,
      issuerThemeKey: IssuersTable.theme_key,
      issuerLogoUrl: IssuersTable.logo_url,
    })
    .from(CredentialsTable)
    .innerJoin(IssuersTable, eq(CredentialsTable.issuer_id, IssuersTable.id))
    .where(
      and(
        eq(CredentialsTable.user_id, session.user.id),
        eq(CredentialsTable.slug, slug)
      )
    )
    .limit(1)

  if (!credential) {
    notFound()
  }

  const availableIssuers = await db
    .select({
      id: IssuersTable.id,
      displayName: IssuersTable.display_name,
      normalizedName: IssuersTable.normalized_name,
      aliases: IssuersTable.aliases,
      kind: IssuersTable.kind,
      themeKey: IssuersTable.theme_key,
      logoUrl: IssuersTable.logo_url,
    })
    .from(IssuersTable)
    .where(
      or(
        eq(IssuersTable.kind, "seeded"),
        eq(IssuersTable.created_by_user_id, session.user.id)
      )
    )
    .orderBy(IssuersTable.display_name)

  const certificateAssetUrl = credential.certificateAssetKey
    ? await getCredentialAssetUrl(credential.certificateAssetKey)
    : null

  return (
    <div className="relative space-y-8 overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_36%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.12),transparent_28%),linear-gradient(180deg,rgba(71,85,105,0.08),transparent_78%)]" />

      <section className="rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/45 px-6 py-7 shadow-lg sm:px-8 sm:py-8 dark:border-white/8 dark:from-background dark:via-card/20 dark:to-card/30 dark:shadow-white/2">
        <div className="space-y-5">
          <Link
            href="/credentials"
            className="inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ChevronLeft className="mr-1 mt-0.5 h-4 w-4" />
            Back to credentials
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Credential Workspace
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                {credential.title}
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                Refine the credential details, manage supporting proof, and set
                how it should appear in your workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CredentialDetailForm
        credential={{
          slug: credential.slug,
          title: credential.title,
          sourceType: credential.sourceType,
          verificationStatus: credential.verificationStatus,
          issuedOn: credential.issuedOn.toISOString(),
          expiresOn: credential.expiresOn?.toISOString() ?? null,
          verificationUrl: credential.verificationUrl,
          verificationCode: credential.verificationCode,
          certificateAssetKey: credential.certificateAssetKey,
          certificateAssetUrl,
          summary: credential.summary,
          status: credential.status,
          issuer: {
            id: credential.issuerId,
            displayName: credential.issuerDisplayName,
            normalizedName: credential.issuerNormalizedName,
            aliases: credential.issuerAliases,
            kind: credential.issuerKind,
            themeKey: credential.issuerThemeKey,
            logoUrl: credential.issuerLogoUrl,
          },
        }}
        availableIssuers={availableIssuers}
      />
    </div>
  )
}
