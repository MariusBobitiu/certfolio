import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Mail } from "lucide-react"

import {
  InformationPage,
  InformationSection,
} from "@/components/landing/information-page"

export const metadata: Metadata = {
  title: "Contact | Certfolio",
  description: "Get in touch with the Certfolio team.",
}

export default function ContactPage() {
  return (
    <InformationPage
      eyebrow="Contact"
      title="Tell us how we can help."
      description="Questions about your account, credential verification, privacy, or the product are welcome. Send enough context for us to point you in the right direction."
    >
      <InformationSection title="Email">
        <div className="flex items-start gap-3">
          <Mail
            className="mt-1 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <a
              href="mailto:hello@certfolio.com"
              className="inline-flex items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:underline"
            >
              hello@certfolio.com
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <p className="mt-1">
              Include the email associated with your account when your question
              is account-specific. Never send a password or recovery code.
            </p>
          </div>
        </div>
      </InformationSection>

      <InformationSection title="What to include">
        <p>
          For technical issues, describe what you were trying to do, what you
          expected, and what happened instead. For credential questions, include
          the issuer and credential title without attaching sensitive personal
          documents unless requested.
        </p>
      </InformationSection>

      <InformationSection title="Account access">
        <p>
          If you can access your account, you can continue to the{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            login page
          </Link>
          . If you have forgotten your password, use the recovery option there.
        </p>
      </InformationSection>
    </InformationPage>
  )
}
