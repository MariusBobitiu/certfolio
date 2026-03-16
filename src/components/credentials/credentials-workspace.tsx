"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"
import { IssuerAutocompleteInput } from "@/components/credentials/issuer-autocomplete-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createCredentialAction } from "@/app/(main)/credentials/action"

type CredentialRecord = {
  id: string
  slug: string
  title: string
  sourceType: "credly" | "issuer_link" | "manual" | "uploaded_certificate"
  verificationStatus: "verified_external" | "linked_external" | "self_declared"
  issuedOn: string
  summary: string
  status: "draft" | "published" | "archived"
  issuer: {
    id: string
    displayName: string
    normalizedName: string
    aliases: string[]
    kind: "seeded" | "custom"
    themeKey: string
    logoUrl: string
  }
}

type IssuerRecord = CredentialRecord["issuer"]

type CreateDraftState = {
  title: string
  issuerQuery: string
  issuerId: string
  issuedMonth: string
  issuedYear: string
  expiresMonth: string
  expiresYear: string
  verificationUrl: string
  verificationCode: string
  summary: string
}

type ActionValidationErrors = {
  title?: { _errors?: string[] }
  customIssuerName?: { _errors?: string[] }
  verificationUrl?: { _errors?: string[] }
  issuedOn?: { _errors?: string[] }
  expiresOn?: { _errors?: string[] }
}

const foundationSignals = [
  "Issuer-led credential identity",
  "External links and self-declared entries kept distinct",
  "Built to expand into richer detail editing next",
] as const

const emptyDraft: CreateDraftState = {
  title: "",
  issuerQuery: "",
  issuerId: "",
  issuedMonth: "",
  issuedYear: "",
  expiresMonth: "",
  expiresYear: "",
  verificationUrl: "",
  verificationCode: "",
  summary: "",
}

const issueMonthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const

const issueYearOptions = Array.from({ length: 61 }, (_, index) => {
  const year = new Date().getFullYear() - index
  return String(year)
})

const expiryYearOptions = Array.from({ length: 61 }, (_, index) => {
  const year = new Date().getFullYear() + 10 - index
  return String(year)
})

export function CredentialsWorkspace({
  initialCredentials,
  availableIssuers,
}: {
  initialCredentials: CredentialRecord[]
  availableIssuers: IssuerRecord[]
}) {
  const [credentials, setCredentials] = useState(initialCredentials)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draft, setDraft] = useState<CreateDraftState>(emptyDraft)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<
    "all" | "draft" | "published" | "archived"
  >("all")

  const { execute, isPending, result } = useAction(createCredentialAction, {
    onSuccess: ({ data }) => {
      if (data?.failure || !data?.credential || !data?.issuer) {
        setSubmitError(
          data?.failure ?? "We could not create the credential right now."
        )
        return
      }

      setCredentials((current) => [
        {
          id: data.credential.id,
          slug: data.credential.slug,
          title: data.credential.title,
          sourceType: data.credential.sourceType,
          verificationStatus: data.credential.verificationStatus,
          issuedOn: data.credential.issuedOn,
          summary: data.credential.summary,
          status: data.credential.status,
          issuer: data.issuer,
        },
        ...current,
      ])

      setDraft(emptyDraft)
      setSubmitError(null)
      setIsDialogOpen(false)
      toast.success("Credential created")
    },
    onError: ({ error }) => {
      setSubmitError(
        error.serverError ?? "We could not create the credential right now."
      )
    },
  })

  const validationErrors =
    (result.validationErrors as ActionValidationErrors | undefined) ?? {}

  const draftCount = credentials.filter(
    (credential) => credential.status === "draft"
  ).length
  const publishedCount = credentials.filter(
    (credential) => credential.status === "published"
  ).length
  const archivedCount = credentials.filter(
    (credential) => credential.status === "archived"
  ).length

  const filteredCredentials =
    activeFilter === "all"
      ? credentials
      : credentials.filter((credential) => credential.status === activeFilter)

  const activeFilterDescription =
    activeFilter === "all"
      ? "All credentials in one workspace, regardless of where they are in the publishing flow."
      : activeFilter === "draft"
        ? "Credentials still being shaped before richer detail editing and public reuse."
        : activeFilter === "published"
          ? "Credentials that are ready to represent your professional identity more directly."
          : "Credentials kept on record without staying in the active collection."

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDraft(emptyDraft)
      setSubmitError(null)
    }

    setIsDialogOpen(open)
  }

  const handleDraftChange = <K extends keyof CreateDraftState>(
    field: K,
    value: CreateDraftState[K]
  ) => {
    if (submitError) {
      setSubmitError(null)
    }

    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleIssuerInputChange = (value: string) => {
    handleDraftChange("issuerQuery", value)
    setDraft((current) => ({
      ...current,
      issuerQuery: value,
      issuerId:
        current.issuerId &&
        availableIssuers.some(
          (issuer) =>
            issuer.id === current.issuerId &&
            issuer.displayName.toLowerCase() === value.trim().toLowerCase()
        )
          ? current.issuerId
          : "",
    }))
  }

  const handleCreateCredential = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    execute({
      title: draft.title,
      issuerId: draft.issuerId,
      customIssuerName: draft.issuerId ? "" : draft.issuerQuery,
      issuedOn:
        draft.issuedYear && draft.issuedMonth
          ? `${draft.issuedYear}-${draft.issuedMonth}`
          : "",
      expiresOn:
        draft.expiresYear && draft.expiresMonth
          ? `${draft.expiresYear}-${draft.expiresMonth}`
          : draft.expiresYear || draft.expiresMonth
            ? "__partial__"
            : "",
      verificationUrl: draft.verificationUrl,
      verificationCode: draft.verificationCode,
      summary: draft.summary,
    })
  }

  return (
    <>
      <div className="space-y-8">
        <section className="relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/55 px-6 py-8 shadow-lg sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:border-white/8 dark:from-background dark:via-card/30 dark:to-card/40 dark:shadow-white/2">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
                Credentials Workspace
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
                  Structure your certifications around issuer identity and proof.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  This workspace now supports real credential records, seeded or
                  custom issuers, and a clean split between externally linked and
                  self-declared entries.
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

            <Button
              className="rounded-full lg:shrink-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add credential
            </Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
              activeFilter === "all"
                ? "border-foreground/15 bg-card"
                : "border-border/70 bg-card/92 hover:border-border/90"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Total
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {credentials.length}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("draft")}
            className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
              activeFilter === "draft"
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border/70 bg-card/92 hover:border-border/90"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Drafts
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {draftCount}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("published")}
            className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
              activeFilter === "published"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border/70 bg-card/92 hover:border-border/90"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Published
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {publishedCount}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("archived")}
            className={`rounded-3xl border px-5 py-5 text-left shadow-md transition-colors dark:border-white/8 dark:shadow-white/2 ${
              activeFilter === "archived"
                ? "border-foreground/15 bg-muted/40"
                : "border-border/70 bg-card/92 hover:border-border/90"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Archived
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {archivedCount}
            </p>
          </button>
        </section>

        <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md backdrop-blur sm:p-8 dark:border-white/8 dark:shadow-white/2">
          <div className="flex flex-col gap-4 border-b border-border/60 pb-5 dark:border-white/8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Collection Surface
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {activeFilter === "all"
                  ? "All credentials"
                  : activeFilter === "draft"
                    ? "Draft credentials"
                    : activeFilter === "published"
                      ? "Published credentials"
                      : "Archived credentials"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {activeFilterDescription}
              </p>
            </div>
          </div>

          {filteredCredentials.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {filteredCredentials.map((credential) => (
                <CredentialCardPreview
                  key={credential.id}
                  issuerDisplayName={credential.issuer.displayName}
                  issuerThemeKey={credential.issuer.themeKey}
                  title={credential.title}
                  issuedOn={credential.issuedOn}
                  sourceType={credential.sourceType}
                  status={credential.status}
                  verificationStatus={credential.verificationStatus}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-4xl border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center dark:border-white/8 dark:bg-white/3">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">
                No credentials in this view yet.
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Add the core facts first, then come back for richer editing in
                the next phase.
              </p>
              <Button
                className="mt-6 rounded-full"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="size-4" />
                Add first credential
              </Button>
            </div>
          )}
        </section>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create credential</DialogTitle>
            <DialogDescription>
              Add the essentials now. You can refine the rest on the detail view
              in the next phase.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCredential} className="space-y-6">
            <FieldGroup>
              <Field data-invalid={Boolean(validationErrors.title?._errors?.[0])}>
                <FieldLabel htmlFor="credential-title">Credential title</FieldLabel>
                <Input
                  id="credential-title"
                  value={draft.title}
                  onChange={(event) => handleDraftChange("title", event.target.value)}
                  placeholder="AWS Solutions Architect Associate"
                  disabled={isPending}
                />
                <FieldError
                  errors={[{ message: validationErrors.title?._errors?.[0] }]}
                />
              </Field>

              <Field
                data-invalid={Boolean(validationErrors.customIssuerName?._errors?.[0])}
              >
                <FieldLabel>Issuer</FieldLabel>
                <IssuerAutocompleteInput
                  issuers={availableIssuers}
                  value={draft.issuerQuery}
                  selectedIssuerId={draft.issuerId || null}
                  onChange={handleIssuerInputChange}
                  onSelectIssuer={(issuer) =>
                    setDraft((current) => ({
                      ...current,
                      issuerQuery: issuer.displayName,
                      issuerId: issuer.id,
                    }))
                  }
                  onSelectCustomIssuer={(value) =>
                    setDraft((current) => ({
                      ...current,
                      issuerQuery: value,
                      issuerId: "",
                    }))
                  }
                  disabled={isPending}
                />
                <FieldError
                  errors={[
                    { message: validationErrors.customIssuerName?._errors?.[0] },
                  ]}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={Boolean(validationErrors.issuedOn?._errors?.[0])}>
                  <FieldLabel>Issue date</FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={draft.issuedMonth}
                      onValueChange={(value) =>
                        handleDraftChange("issuedMonth", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueMonthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={draft.issuedYear}
                      onValueChange={(value) =>
                        handleDraftChange("issuedYear", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldError
                    errors={[{ message: validationErrors.issuedOn?._errors?.[0] }]}
                  />
                </Field>

                <Field
                  data-invalid={Boolean(validationErrors.expiresOn?._errors?.[0])}
                >
                  <FieldLabel>Expiry date</FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={draft.expiresMonth}
                      onValueChange={(value) =>
                        handleDraftChange("expiresMonth", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueMonthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={draft.expiresYear}
                      onValueChange={(value) =>
                        handleDraftChange("expiresYear", value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldError
                    errors={[{ message: validationErrors.expiresOn?._errors?.[0] }]}
                  />
                </Field>
              </div>

              <Field
                data-invalid={Boolean(
                  validationErrors.verificationUrl?._errors?.[0]
                )}
              >
                <FieldLabel htmlFor="verification-url">Verification link</FieldLabel>
                <Input
                  id="verification-url"
                  type="url"
                  value={draft.verificationUrl}
                  onChange={(event) =>
                    handleDraftChange("verificationUrl", event.target.value)
                  }
                  placeholder="https://..."
                  disabled={isPending}
                />
                <FieldError
                  errors={[
                    { message: validationErrors.verificationUrl?._errors?.[0] },
                  ]}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="verification-code">Verification code</FieldLabel>
                <Input
                  id="verification-code"
                  value={draft.verificationCode}
                  onChange={(event) =>
                    handleDraftChange("verificationCode", event.target.value)
                  }
                  placeholder="Optional"
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="credential-summary">Summary</FieldLabel>
                <Textarea
                  id="credential-summary"
                  value={draft.summary}
                  onChange={(event) =>
                    handleDraftChange("summary", event.target.value)
                  }
                  placeholder="Optional context for why this credential matters."
                  disabled={isPending}
                />
              </Field>
            </FieldGroup>

            <FieldError errors={submitError ? [{ message: submitError }] : []} />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                Create credential
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
