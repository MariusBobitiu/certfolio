import { Mail } from "lucide-react"

export function ProfileCtaSection({
  email,
  showEmail,
}: {
  email: string
  showEmail: boolean
}) {
  if (!showEmail) return null

  return (
    <section className="pt-2 text-center sm:text-left">
      <p className="text-sm text-muted-foreground">Open to opportunities</p>
      <a
        href={`mailto:${email}`}
        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <Mail className="size-4" />
        {email}
      </a>
    </section>
  )
}
