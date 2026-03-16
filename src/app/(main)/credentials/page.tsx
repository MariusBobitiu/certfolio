import { Metadata } from "next"
import { desc, eq, or } from "drizzle-orm"

import { getCurrentSession } from "@/lib/auth/session"
import { CredentialsTable, IssuersTable, db } from "@/lib/db/drizzle"
import { CredentialsWorkspace } from "@/components/credentials/credentials-workspace"

export const metadata: Metadata = {
  title: "Credentials - Certfolio",
  description:
    "Manage structured credentials on Certfolio with issuer-led identity and verification-aware card design.",
  authors: [
    {
      name: "Marius Bobitiu",
      url: "https://mariusbobitiu.dev",
    },
  ],
}

export default async function CredentialsPage() {
  const session = await getCurrentSession()
  const credentials = session
    ? await db
        .select({
          id: CredentialsTable.id,
          slug: CredentialsTable.slug,
          title: CredentialsTable.title,
          sourceType: CredentialsTable.source_type,
          verificationStatus: CredentialsTable.verification_status,
          issuedOn: CredentialsTable.issued_on,
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
        .where(eq(CredentialsTable.user_id, session.user.id))
        .orderBy(desc(CredentialsTable.issued_on), desc(CredentialsTable.created_at))
    : []

  const availableIssuers = session
    ? await db
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
    : []

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.14),transparent_28%),linear-gradient(180deg,rgba(71,85,105,0.08),transparent_78%)]" />
      <CredentialsWorkspace
        initialCredentials={credentials.map((credential) => ({
          id: credential.id,
          slug: credential.slug,
          title: credential.title,
          sourceType: credential.sourceType,
          verificationStatus: credential.verificationStatus,
          issuedOn: credential.issuedOn.toISOString(),
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
        }))}
        availableIssuers={availableIssuers}
      />
    </div>
  )
}
