"use client"

import Link from "next/link"
import { Plus, X } from "lucide-react"

import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"
import { ProfileSectionHeader } from "@/components/profile/profile-section-header"
import type { PublishedCredentialForPicker } from "@/data/profile-management"
import { cn } from "@/lib/utils"

type ProfileFeaturedCredentialsProps = {
  credentials: PublishedCredentialForPicker[]
  selectedIds: string[]
  onChangeAction: (ids: string[]) => void
}

const MAX = 6

export function ProfileFeaturedCredentials({
  credentials,
  selectedIds,
  onChangeAction,
}: ProfileFeaturedCredentialsProps) {
  const selectedIdSet = new Set(selectedIds)
  const featured = credentials.filter((c) => selectedIdSet.has(c.id))
  const unfeatured = credentials.filter((c) => !selectedIdSet.has(c.id))

  const addItem = (id: string) => {
    if (selectedIds.length >= MAX) return
    onChangeAction([...selectedIds, id])
  }

  const removeItem = (id: string) => {
    onChangeAction(selectedIds.filter((sid) => sid !== id))
  }

  if (credentials.length === 0) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <ProfileSectionHeader
          label="Featured credentials"
          subtitle="Credentials you feature will appear on your public profile."
        />
        <div className="mt-5 flex min-h-30 items-center justify-center rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No published credentials yet.{" "}
            <Link
              href="/credentials"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              Publish credentials
            </Link>{" "}
            to feature them here.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <ProfileSectionHeader
        label="Featured credentials"
        subtitle={
          credentials.length > MAX
            ? `Choose up to ${MAX} credentials to show on your public profile.`
            : "Choose which credentials appear on your public profile."
        }
        count={featured.length > 0 ? `${featured.length} featured` : undefined}
      />

      <div className="mt-5 space-y-8">
        {/* Featured items — card grid */}
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featured.map((cred) => (
              <div key={cred.id} className="group relative">
                <CredentialCardPreview
                  issuerDisplayName={cred.issuer_display_name}
                  issuerThemeKey={cred.issuer_theme_key}
                  title={cred.title}
                  verificationStatus={cred.verification_status}
                  issuedOn={cred.issued_on.toISOString()}
                />
                {/* Remove button overlay */}
                <button
                  type="button"
                  onClick={() => removeItem(cred.id)}
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 ring-1 ring-border/40 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${cred.title} from featured`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No credentials featured — all published credentials will appear on
            your public profile.
          </p>
        )}

        {/* Unfeatured "add more" list */}
        {unfeatured.length > 0 && (
          <div className="space-y-1">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Add more
            </p>
            <div className="space-y-1">
              {unfeatured.map((cred) => (
                <button
                  key={cred.id}
                  type="button"
                  onClick={() => addItem(cred.id)}
                  disabled={selectedIds.length >= MAX}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    selectedIds.length >= MAX
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-secondary/60"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      selectedIds.length >= MAX
                        ? "border-border/40 text-muted-foreground/30"
                        : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    <Plus className="size-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {cred.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cred.issuer_display_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {cred.verification_status === "verified_external"
                      ? "Verified"
                      : cred.verification_status === "linked_external"
                        ? "Linked"
                        : "Record"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
