"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileBadge2,
  Link2,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

import {
  deleteCredentialAction,
  updateCredentialAction,
} from "@/app/(main)/credentials/action"
import { CredentialCardPreview } from "@/components/credentials/credential-card-preview"
import {
  type IssuerAutocompleteOption,
  IssuerAutocompleteInput,
} from "@/components/credentials/issuer-autocomplete-input"
import { CredentialVerificationBadge } from "@/components/credentials/credential-verification-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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

type CredentialStatus = "draft" | "published"
type PersistedCredentialStatus = CredentialStatus | "archived"
type CredentialSourceType =
  | "credly"
  | "issuer_link"
  | "manual"
  | "uploaded_certificate"
type CredentialVerificationStatus =
  | "verified_external"
  | "linked_external"
  | "self_declared"

const visibilityOptionLabels = {
  draft: "Private",
  published: "Public",
  archived: "Private",
} as const

const sourceTypeLabels = {
  credly: "Credly",
  issuer_link: "External proof",
  manual: "Direct entry",
  uploaded_certificate: "Uploaded proof",
} as const

type CredentialDetailFormProps = {
  credential: {
    slug: string
    title: string
    sourceType: CredentialSourceType
    verificationStatus: CredentialVerificationStatus
    issuedOn: string
    expiresOn: string | null
    verificationUrl: string
    verificationCode: string
    certificateAssetKey: string
    certificateAssetUrl: string | null
    summary: string
    status: PersistedCredentialStatus
    issuer: IssuerAutocompleteOption & {
      themeKey: string
      logoUrl: string
    }
  }
  availableIssuers: Array<
    IssuerAutocompleteOption & {
      themeKey: string
      logoUrl: string
    }
  >
}

type CredentialFormState = {
  slug: string
  title: string
  issuerQuery: string
  issuerId: string
  issuedMonth: string
  issuedYear: string
  expiresMonth: string
  expiresYear: string
  verificationUrl: string
  verificationCode: string
  certificateAssetKey: string
  certificateAssetUrl: string | null
  summary: string
  status: CredentialStatus
  sourceType: CredentialSourceType
  verificationStatus: CredentialVerificationStatus
  issuer: CredentialDetailFormProps["credential"]["issuer"]
}

type ActionValidationErrors = {
  title?: { _errors?: string[] }
  customIssuerName?: { _errors?: string[] }
  issuedOn?: { _errors?: string[] }
  expiresOn?: { _errors?: string[] }
  verificationUrl?: { _errors?: string[] }
  certificateAssetKey?: { _errors?: string[] }
  status?: { _errors?: string[] }
}

const monthOptions = [
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

function getMonthYearParts(value: string | null) {
  if (!value) {
    return { month: "", year: "" }
  }

  const date = new Date(value)
  return {
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
    year: String(date.getUTCFullYear()),
  }
}

function createInitialFormState(
  credential: CredentialDetailFormProps["credential"]
): CredentialFormState {
  const issued = getMonthYearParts(credential.issuedOn)
  const expires = getMonthYearParts(credential.expiresOn)

  return {
    slug: credential.slug,
    title: credential.title,
    issuerQuery: credential.issuer.displayName,
    issuerId: credential.issuer.id,
    issuedMonth: issued.month,
    issuedYear: issued.year,
    expiresMonth: expires.month,
    expiresYear: expires.year,
    verificationUrl: credential.verificationUrl,
    verificationCode: credential.verificationCode,
    certificateAssetKey: credential.certificateAssetKey,
    certificateAssetUrl: credential.certificateAssetUrl,
    summary: credential.summary,
    status: credential.status === "published" ? "published" : "draft",
    sourceType: credential.sourceType,
    verificationStatus: credential.verificationStatus,
    issuer: credential.issuer,
  }
}

export function CredentialDetailForm({
  credential,
  availableIssuers,
}: CredentialDetailFormProps) {
  const router = useRouter()
  const [formState, setFormState] = useState<CredentialFormState>(
    createInitialFormState(credential)
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [certificateUploadError, setCertificateUploadError] = useState<
    string | null
  >(null)
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { execute, isPending, result } = useAction(updateCredentialAction, {
    onSuccess: ({ data }) => {
      if (data?.failure || !data?.credential || !data?.issuer) {
        setSubmitError(
          data?.failure ?? "We could not update the credential right now."
        )
        return
      }

      setFormState((current) => ({
        ...current,
        title: data.credential.title,
        issuerQuery: data.issuer.displayName,
        issuerId: data.issuer.id,
        issuedMonth: getMonthYearParts(data.credential.issuedOn).month,
        issuedYear: getMonthYearParts(data.credential.issuedOn).year,
        expiresMonth: getMonthYearParts(data.credential.expiresOn).month,
        expiresYear: getMonthYearParts(data.credential.expiresOn).year,
        verificationUrl: data.credential.verificationUrl,
        verificationCode: data.credential.verificationCode,
        certificateAssetKey: data.credential.certificateAssetKey,
        summary: data.credential.summary,
        status:
          data.credential.status === "published" ? "published" : "draft",
        sourceType: data.credential.sourceType,
        verificationStatus: data.credential.verificationStatus,
        issuer: {
          ...data.issuer,
          themeKey: current.issuer.id === data.issuer.id
            ? current.issuer.themeKey
            : availableIssuers.find((issuer) => issuer.id === data.issuer.id)
                ?.themeKey ?? "",
          logoUrl: current.issuer.id === data.issuer.id
            ? current.issuer.logoUrl
            : availableIssuers.find((issuer) => issuer.id === data.issuer.id)
                ?.logoUrl ?? "",
        },
      }))
      setSubmitError(null)
      toast.success("Credential updated")
    },
    onError: ({ error }) => {
      setSubmitError(
        error.serverError ?? "We could not update the credential right now."
      )
    },
  })

  const validationErrors =
    (result.validationErrors as ActionValidationErrors | undefined) ?? {}

  const { execute: deleteCredential, isPending: isDeletingCredential } =
    useAction(deleteCredentialAction, {
      onSuccess: ({ data }) => {
        if (data?.failure) {
          toast.error(data.failure)
          return
        }

        toast.success("Credential removed from workspace")
        router.push("/credentials")
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError ?? "We could not delete the credential right now."
        )
      },
    })

  const isBusy = isPending || isUploadingCertificate || isDeletingCredential

  const handleChange = <K extends keyof CredentialFormState>(
    field: K,
    value: CredentialFormState[K]
  ) => {
    if (submitError) {
      setSubmitError(null)
    }

    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleIssuerInputChange = (value: string) => {
    handleChange("issuerQuery", value)
    setFormState((current) => ({
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    execute({
      slug: formState.slug,
      title: formState.title,
      issuerId: formState.issuerId,
      customIssuerName: formState.issuerId ? "" : formState.issuerQuery,
      issuedOn:
        formState.issuedYear && formState.issuedMonth
          ? `${formState.issuedYear}-${formState.issuedMonth}`
          : "",
      expiresOn:
        formState.expiresYear && formState.expiresMonth
          ? `${formState.expiresYear}-${formState.expiresMonth}`
          : formState.expiresYear || formState.expiresMonth
            ? "__partial__"
            : "",
      verificationUrl: formState.verificationUrl,
      verificationCode: formState.verificationCode,
      certificateAssetKey: formState.certificateAssetKey,
      summary: formState.summary,
      status: formState.status,
    })
  }

  const uploadCertificateFile = async (file: File) => {
    if (!file) {
      return
    }

    setCertificateUploadError(null)
    setIsUploadingCertificate(true)

    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("credentialSlug", formState.slug)
      if (formState.certificateAssetKey) {
        formData.set("currentCertificateAssetKey", formState.certificateAssetKey)
      }

      const response = await fetch("/api/credentials/certificate", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as
        | { key: string; url: string }
        | { error: string }

      if (!response.ok || !("key" in data)) {
        setCertificateUploadError(
          "error" in data
            ? data.error
            : "We could not upload the certificate right now."
        )
        return
      }

      setFormState((current) => ({
        ...current,
        certificateAssetKey: data.key,
        certificateAssetUrl: data.url,
      }))
      toast.success("Certificate uploaded")
    } catch {
      setCertificateUploadError(
        "We could not upload the certificate right now."
      )
    } finally {
      setIsUploadingCertificate(false)
    }
  }

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    disabled: isBusy,
    maxFiles: 1,
    noClick: true,
    onDropAccepted: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) {
        return
      }

      void uploadCertificateFile(file)
    },
    onDropRejected: () => {
      setCertificateUploadError(
        "Upload a PDF, PNG, JPG, or WebP file under 8MB."
      )
    },
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="rounded-4xl border border-border/70 bg-card/92 px-5 py-4 shadow-md backdrop-blur sm:px-6 dark:border-white/8 dark:shadow-white/2">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center xl:flex-1">
            <div className="flex items-center gap-3">
              <Select
                value={formState.status}
                onValueChange={(value) =>
                  handleChange("status", value as CredentialStatus)
                }
                disabled={isBusy}
              >
                <SelectTrigger className="w-full max-w-40">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Private</SelectItem>
                  <SelectItem value="published">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Proof</span>
              <CredentialVerificationBadge
                status={formState.verificationStatus}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Visibility</span>
              <span className="text-base font-medium text-foreground">
                {visibilityOptionLabels[formState.status]}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Source</span>
              <span className="text-base font-medium text-foreground">
                {sourceTypeLabels[formState.sourceType]}
              </span>
            </div>
          </div>

          <Button type="submit" disabled={isBusy} className="rounded-full">
            Save changes
          </Button>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isBusy}
                className="rounded-full"
              >
                <Trash2 className="size-4" />
                Remove from workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this credential?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will hide the credential from your workspace and keep it
                  out of the public surface. You can still retain the record
                  internally.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => deleteCredential({ slug: formState.slug })}
                >
                  Remove credential
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <FieldError
        errors={[{ message: validationErrors.status?._errors?.[0] }]}
      />
      <FieldError errors={submitError ? [{ message: submitError }] : []} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
        <div className="space-y-8">
          <FieldGroup>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Credential Details
                </p>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Keep the entry clear at a glance: title, issuer, proof, and
                  timing.
                </p>
              </div>

              <Field
                data-invalid={Boolean(validationErrors.title?._errors?.[0])}
              >
                <FieldLabel htmlFor="credential-title">
                  Credential title
                </FieldLabel>
                <Input
                  id="credential-title"
                  value={formState.title}
                  disabled={isBusy}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
                />
                <FieldError
                  errors={[{ message: validationErrors.title?._errors?.[0] }]}
                />
              </Field>

              <Field
                data-invalid={Boolean(
                  validationErrors.customIssuerName?._errors?.[0]
                )}
              >
                <FieldLabel>Issuer</FieldLabel>
                <IssuerAutocompleteInput
                  issuers={availableIssuers}
                  value={formState.issuerQuery}
                  selectedIssuerId={formState.issuerId}
                  onChange={handleIssuerInputChange}
                  onSelectIssuer={(issuer) => {
                    const fullIssuer =
                      availableIssuers.find(
                        (entry) => entry.id === issuer.id
                      ) ?? null

                    setFormState((current) => ({
                      ...current,
                      issuerQuery: issuer.displayName,
                      issuerId: issuer.id,
                      issuer: fullIssuer ?? {
                        ...issuer,
                        themeKey: "",
                        logoUrl: "",
                      },
                    }))
                  }}
                  onSelectCustomIssuer={(value) =>
                    setFormState((current) => ({
                      ...current,
                      issuerQuery: value,
                      issuerId: "",
                    }))
                  }
                  disabled={isBusy}
                />
                <FieldError
                  errors={[
                    {
                      message: validationErrors.customIssuerName?._errors?.[0],
                    },
                  ]}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  data-invalid={Boolean(
                    validationErrors.issuedOn?._errors?.[0]
                  )}
                >
                  <FieldLabel>Issue date</FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={formState.issuedMonth}
                      onValueChange={(value) =>
                        handleChange("issuedMonth", value)
                      }
                      disabled={isBusy}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formState.issuedYear}
                      onValueChange={(value) =>
                        handleChange("issuedYear", value)
                      }
                      disabled={isBusy}
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
                    errors={[
                      { message: validationErrors.issuedOn?._errors?.[0] },
                    ]}
                  />
                </Field>

                <Field
                  data-invalid={Boolean(
                    validationErrors.expiresOn?._errors?.[0]
                  )}
                >
                  <FieldLabel>Expiry date</FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={formState.expiresMonth}
                      onValueChange={(value) =>
                        handleChange("expiresMonth", value)
                      }
                      disabled={isBusy}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formState.expiresYear}
                      onValueChange={(value) =>
                        handleChange("expiresYear", value)
                      }
                      disabled={isBusy}
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
                    errors={[
                      { message: validationErrors.expiresOn?._errors?.[0] },
                    ]}
                  />
                </Field>
              </div>

              <Field
                data-invalid={Boolean(
                  validationErrors.verificationUrl?._errors?.[0]
                )}
              >
                <FieldLabel htmlFor="verification-url">
                  Verification link
                </FieldLabel>
                <Input
                  id="verification-url"
                  type="url"
                  value={formState.verificationUrl}
                  disabled={isBusy}
                  onChange={(event) =>
                    handleChange("verificationUrl", event.target.value)
                  }
                  placeholder="https://..."
                />
                <FieldDescription>
                  Add a public proof link when the issuer provides one.
                </FieldDescription>
                <FieldError
                  errors={[
                    { message: validationErrors.verificationUrl?._errors?.[0] },
                  ]}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="verification-code">
                  Verification code
                </FieldLabel>
                <Input
                  id="verification-code"
                  value={formState.verificationCode}
                  disabled={isBusy}
                  onChange={(event) =>
                    handleChange("verificationCode", event.target.value)
                  }
                  placeholder="Optional"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="credential-summary">Summary</FieldLabel>
                <Textarea
                  id="credential-summary"
                  value={formState.summary}
                  disabled={isBusy}
                  onChange={(event) =>
                    handleChange("summary", event.target.value)
                  }
                  className="min-h-32"
                  placeholder="Optional context for why this credential matters."
                />
              </Field>
            </div>

            <FieldSeparator>Proof</FieldSeparator>

            <div className="space-y-5">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Upload a certificate file if you want a stored supporting
                document in addition to any external verification link.
              </p>

              <Field
                data-invalid={Boolean(
                  validationErrors.certificateAssetKey?._errors?.[0]
                )}
              >
                <FieldLabel>Certificate file</FieldLabel>
                <div
                  {...getRootProps()}
                  className={`rounded-3xl border border-dashed px-5 py-6 transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card/60 dark:border-white/8"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Drop a PDF or image here, or browse to upload.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supported: PDF, PNG, JPG, WebP. Max 8MB.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isBusy}
                      onClick={open}
                      className="rounded-full"
                    >
                      {isUploadingCertificate ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      Upload file
                    </Button>
                  </div>
                </div>
                <FieldError
                  errors={[
                    { message: certificateUploadError ?? undefined },
                    {
                      message:
                        validationErrors.certificateAssetKey?._errors?.[0],
                    },
                  ]}
                />
              </Field>
            </div>
          </FieldGroup>
        </div>

        <div className="space-y-6 xl:sticky xl:top-8">
          <div className="rounded-4xl border border-border/70 bg-card/92 p-5 shadow-md backdrop-blur dark:border-white/8 dark:shadow-white/2">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Preview
            </p>
            <CredentialCardPreview
              className="mt-4"
              issuerDisplayName={formState.issuerQuery || "Custom issuer"}
              issuerThemeKey={formState.issuer.themeKey}
              title={formState.title || "Credential title"}
              issuedOn={
                formState.issuedYear && formState.issuedMonth
                  ? new Date(
                      `${formState.issuedYear}-${formState.issuedMonth}-01T00:00:00.000Z`
                    ).toISOString()
                  : credential.issuedOn
              }
              verificationStatus={formState.verificationStatus}
            />
          </div>

          <div className="rounded-4xl border border-border/70 bg-card/92 p-5 shadow-md backdrop-blur dark:border-white/8 dark:shadow-white/2">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Attached proof
            </p>

            <div className="mt-4 space-y-3">
              {formState.verificationUrl ? (
                <a
                  href={formState.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm hover:bg-accent/40 dark:border-white/8"
                >
                  <div className="min-w-0">
                    <p className="font-medium">Verification link</p>
                    <p className="truncate text-muted-foreground">
                      {formState.verificationUrl}
                    </p>
                  </div>
                  <Link2 className="size-4 shrink-0 text-muted-foreground" />
                </a>
              ) : null}

              {formState.certificateAssetUrl ? (
                <a
                  href={formState.certificateAssetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm hover:bg-accent/40 dark:border-white/8"
                >
                  <div className="min-w-0">
                    <p className="font-medium">Uploaded certificate</p>
                    <p className="truncate text-muted-foreground">
                      Open the current stored file
                    </p>
                  </div>
                  <FileBadge2 className="size-4 shrink-0 text-muted-foreground" />
                </a>
              ) : (
                <p className="rounded-2xl border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground dark:border-white/8">
                  No certificate file uploaded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
