import type { Metadata } from "next"
import Link from "next/link"

import {
  InformationPage,
  InformationSection,
} from "@/components/landing/information-page"

export const metadata: Metadata = {
  title: "Terms | Certfolio",
  description: "The terms that apply when you use Certfolio.",
}

export default function TermsPage() {
  return (
    <InformationPage
      eyebrow="Terms"
      title="Straightforward terms for using Certfolio."
      description="These terms describe the basic rules for creating an account, publishing a profile, and using Certfolio responsibly. Last updated 8 August 2026."
    >
      <InformationSection title="Your account">
        <p>
          You are responsible for the accuracy of the information you provide,
          keeping your sign-in details secure, and activity that takes place
          through your account. Tell us promptly if you believe your account has
          been compromised.
        </p>
      </InformationSection>

      <InformationSection title="Your content">
        <p>
          You keep ownership of the credentials, project descriptions, files,
          links, and other material you add. You give Certfolio permission to
          host, process, and display that content only as needed to operate and
          improve the service.
        </p>
        <p>
          You must have the right to upload and publish your content. Do not add
          confidential material, infringe another person’s rights, or present
          misleading claims about qualifications or work.
        </p>
      </InformationSection>

      <InformationSection title="Verification">
        <p>
          Verification indicators describe the evidence or source available to
          Certfolio at the time of review. They are not a guarantee of ongoing
          competence, employment suitability, or the continued validity of an
          external credential.
        </p>
      </InformationSection>

      <InformationSection title="Acceptable use">
        <p>
          Do not use Certfolio to break the law, impersonate another person,
          distribute harmful code, scrape or disrupt the service, bypass access
          controls, or abuse other users or third parties.
        </p>
      </InformationSection>

      <InformationSection title="Service changes">
        <p>
          We may update, suspend, or discontinue features as the product
          develops. We aim to keep Certfolio reliable, but the service is
          provided without a promise that it will always be available or free
          from errors.
        </p>
      </InformationSection>

      <InformationSection title="Ending access">
        <p>
          You may stop using Certfolio at any time. We may restrict or close an
          account that materially breaches these terms, threatens the service,
          or creates risk for other people.
        </p>
      </InformationSection>

      <InformationSection title="Contact">
        <p>
          If you have a question about these terms, use the{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            contact page
          </Link>
          .
        </p>
      </InformationSection>
    </InformationPage>
  )
}
