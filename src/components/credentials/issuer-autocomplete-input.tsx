"use client"

import { useMemo } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type IssuerAutocompleteOption = {
  id: string
  displayName: string
  normalizedName: string
  aliases: string[]
  kind: "seeded" | "custom"
}

export function IssuerAutocompleteInput({
  issuers,
  value,
  selectedIssuerId,
  onChange,
  onSelectIssuer,
  disabled,
}: {
  issuers: IssuerAutocompleteOption[]
  value: string
  selectedIssuerId: string | null
  onChange: (value: string) => void
  onSelectIssuer: (issuer: IssuerAutocompleteOption) => void
  disabled?: boolean
}) {
  const normalizedValue = value.trim().toLowerCase()
  const filteredIssuers = useMemo(() => {
    if (!normalizedValue) {
      return issuers.slice(0, 6)
    }

    return issuers
      .filter((issuer) => {
        const haystack = [
          issuer.displayName.toLowerCase(),
          issuer.normalizedName.toLowerCase(),
          ...issuer.aliases.map((alias) => alias.toLowerCase()),
        ]

        return haystack.some((entry) => entry.includes(normalizedValue))
      })
      .slice(0, 6)
  }, [issuers, normalizedValue])

  const selectedIssuer = selectedIssuerId
    ? issuers.find((issuer) => issuer.id === selectedIssuerId) ?? null
    : null

  const willCreateCustomIssuer =
    value.trim().length > 0 &&
    !filteredIssuers.some(
      (issuer) =>
        issuer.displayName.toLowerCase() === normalizedValue ||
        issuer.normalizedName.toLowerCase() === normalizedValue ||
        issuer.aliases.some((alias) => alias.toLowerCase() === normalizedValue)
    ) &&
    (!selectedIssuer ||
      selectedIssuer.displayName.toLowerCase() !== normalizedValue)

  return (
    <div className="space-y-3">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search issuers or type a custom one"
        disabled={disabled}
      />

      {filteredIssuers.length > 0 ? (
        <div className="rounded-3xl border border-border/70 bg-background/70 p-2 dark:border-white/8 dark:bg-white/3">
          <div className="grid gap-1.5">
            {filteredIssuers.map((issuer) => {
              const aliasHint = issuer.aliases[0]

              return (
                <button
                  key={issuer.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectIssuer(issuer)}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-left transition-colors",
                    selectedIssuerId === issuer.id
                      ? "border-foreground/15 bg-card"
                      : "border-transparent hover:border-border/70 hover:bg-card/80"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">
                    {issuer.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {aliasHint
                      ? `${issuer.kind === "seeded" ? "Seeded issuer" : "Custom issuer"} · Alias: ${aliasHint}`
                      : issuer.kind === "seeded"
                        ? "Seeded issuer"
                        : "Custom issuer"}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {selectedIssuer ? (
        <p className="text-xs text-muted-foreground">
          Selected issuer: {selectedIssuer.displayName}
        </p>
      ) : willCreateCustomIssuer ? (
        <p className="text-xs text-muted-foreground">
          Create custom issuer: {value.trim()}
        </p>
      ) : null}
    </div>
  )
}
