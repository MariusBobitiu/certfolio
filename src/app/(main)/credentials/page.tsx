import { Metadata } from "next"
import { and, desc, eq, ne, or } from "drizzle-orm"

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

const foundationSignals = [
  "Issuer-led credential identity",
  "Verified links and profile records kept distinct",
  "Built to expand into richer detail editing next",
] as const

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
        .where(
          and(
            eq(CredentialsTable.user_id, session.user.id),
            ne(CredentialsTable.status, "archived")
          )
        )
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

  const hasCredentials = credentials.length > 0

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.14),transparent_28%),linear-gradient(180deg,rgba(71,85,105,0.08),transparent_78%)]" />

      {hasCredentials ? (
        <section className="relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/50 px-6 py-6 shadow-lg sm:px-8 sm:py-7 dark:border-white/8 dark:from-background dark:via-card/25 dark:to-card/35 dark:shadow-white/2">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
                Credentials Workspace
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
                Shape a stronger body of verified professional identity.
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Use this index to review private drafts, revisit public
                credentials, and keep issuer-led proof aligned with the
                professional identity you want Certfolio to present.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
              {foundationSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm text-foreground/85 backdrop-blur dark:border-white/8 dark:bg-white/3"
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/55 px-6 py-8 shadow-lg sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:border-white/8 dark:from-background dark:via-card/30 dark:to-card/40 dark:shadow-white/2">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
              Credentials Workspace
            </div>

            <div className="space-y-4">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
                Structure credentials around issuer identity and proof.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Certfolio credentials are meant to hold more than a title and a
                badge. This workspace is being structured for issuer-led
                presentation, verification-aware proof, and future profile
                reuse.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {foundationSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm text-foreground/85 backdrop-blur dark:border-white/8 dark:bg-white/3"
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
