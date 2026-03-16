"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete"
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
  onSelectCustomIssuer,
  disabled,
}: {
  issuers: IssuerAutocompleteOption[]
  value: string
  selectedIssuerId: string | null
  onChange: (value: string) => void
  onSelectIssuer: (issuer: IssuerAutocompleteOption) => void
  onSelectCustomIssuer: (value: string) => void
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const normalizedValue = value.trim().toLowerCase()

  const filteredIssuers = useMemo(() => {
    const scoredIssuers = issuers
      .map((issuer) => {
        const displayName = issuer.displayName.toLowerCase()
        const normalizedName = issuer.normalizedName.toLowerCase()
        const aliases = issuer.aliases.map((alias) => alias.toLowerCase())

        let score = 0

        if (!normalizedValue) {
          score = issuer.kind === "seeded" ? 1 : 0
        } else if (
          displayName === normalizedValue ||
          normalizedName === normalizedValue ||
          aliases.includes(normalizedValue)
        ) {
          score = 6
        } else if (
          displayName.startsWith(normalizedValue) ||
          normalizedName.startsWith(normalizedValue) ||
          aliases.some((alias) => alias.startsWith(normalizedValue))
        ) {
          score = 5
        } else if (
          displayName.includes(normalizedValue) ||
          normalizedName.includes(normalizedValue) ||
          aliases.some((alias) => alias.includes(normalizedValue))
        ) {
          score = 4
        }

        if (score === 0) {
          return null
        }

        return { issuer, score }
      })
      .filter(Boolean) as Array<{ issuer: IssuerAutocompleteOption; score: number }>

    return scoredIssuers
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }

        if (left.issuer.kind !== right.issuer.kind) {
          return left.issuer.kind === "seeded" ? -1 : 1
        }

        return left.issuer.displayName.localeCompare(right.issuer.displayName)
      })
      .map((entry) => entry.issuer)
      .slice(0, 8)
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

  const optionCount = filteredIssuers.length + (willCreateCustomIssuer ? 1 : 0)

  const handleInputChange = (nextValue: string) => {
    setActiveIndex(0)
    setIsOpen(true)
    onChange(nextValue)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || optionCount === 0) {
      if (event.key === "ArrowDown" && optionCount > 0) {
        event.preventDefault()
        setIsOpen(true)
      }
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((current) =>
        current >= optionCount - 1 ? 0 : current + 1
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((current) =>
        current <= 0 ? optionCount - 1 : current - 1
      )
      return
    }

    if (event.key === "Enter") {
      const activeIssuer = filteredIssuers[activeIndex]
      if (activeIssuer) {
        event.preventDefault()
        onSelectIssuer(activeIssuer)
        setIsOpen(false)
        return
      }

      if (willCreateCustomIssuer && activeIndex === filteredIssuers.length) {
        event.preventDefault()
        onSelectCustomIssuer(value.trim())
        setIsOpen(false)
        return
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      <Autocomplete>
        <div className="relative">
          <AutocompleteInput
            value={value}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search issuers or type a custom one"
            disabled={disabled}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            role="combobox"
            clearable
            onClear={() => {
              setActiveIndex(0)
              setIsOpen(false)
              onChange("")
            }}
            trailingIcon={
              <ChevronsUpDown className="size-4" />
            }
          />
        </div>

        {isOpen ? (
          <AutocompleteContent>
            {optionCount > 0 ? (
              <AutocompleteList>
                {filteredIssuers.map((issuer, index) => {
                  const isSelected = selectedIssuerId === issuer.id

                  return (
                    <AutocompleteItem
                      key={issuer.id}
                      active={index === activeIndex}
                      selected={isSelected}
                      disabled={disabled}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onSelectIssuer(issuer)
                        setIsOpen(false)
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {issuer.displayName}
                        </p>
                      </div>
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0 text-primary transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </AutocompleteItem>
                  )
                })}

                {willCreateCustomIssuer ? (
                  <AutocompleteItem
                    active={activeIndex === filteredIssuers.length}
                    onMouseEnter={() => setActiveIndex(filteredIssuers.length)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelectCustomIssuer(value.trim())
                      setIsOpen(false)
                    }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Add custom issuer: &quot;{value.trim()}&quot;
                        </p>
                      </div>
                    <Plus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </AutocompleteItem>
                ) : null}
              </AutocompleteList>
            ) : (
              <AutocompleteEmpty>No issuers found.</AutocompleteEmpty>
            )}
          </AutocompleteContent>
        ) : null}
      </Autocomplete>
    </div>
  )
}
