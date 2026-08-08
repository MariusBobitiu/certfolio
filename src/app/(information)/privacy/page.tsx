import type { Metadata } from "next"
import Link from "next/link"

import {
  InformationPage,
  InformationSection,
} from "@/components/landing/information-page"

export const metadata: Metadata = {
  title: "Privacy | Certfolio",
  description: "How Certfolio collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="Privacy"
      title="Your work is yours. Your privacy should be clear."
      description="This page explains what information Certfolio handles, why it is needed, and the choices you have when building a professional profile. Last updated 8 August 2026."
    >
      <InformationSection title="Information we collect">
        <p>
          We collect the account details you provide, such as your name and
          email address, together with the credentials, projects, links, and
          profile information you choose to add.
        </p>
        <p>
          We may also process basic technical and security information needed to
          operate the service, including session data, request logs, device or
          browser details, and actions taken within your account.
        </p>
      </InformationSection>

      <InformationSection title="How we use it">
        <p>
          We use this information to provide and secure your account, display
          the profile you create, verify supported credentials, store project
          evidence, respond to support requests, and improve the reliability of
          Certfolio.
        </p>
        <p>We do not sell your personal information.</p>
      </InformationSection>

      <InformationSection title="Public profiles">
        <p>
          You control whether your profile is public. Information on a public
          profile can be viewed and shared by anyone with its link. Keep private
          or sensitive material out of content you choose to publish.
        </p>
      </InformationSection>

      <InformationSection title="Service providers">
        <p>
          We may use trusted providers for infrastructure, storage, email,
          security, analytics, and credential verification. They receive only
          the information needed to perform those services and are expected to
          protect it appropriately.
        </p>
      </InformationSection>

      <InformationSection title="Retention and choices">
        <p>
          We retain information while your account is active and as reasonably
          needed to operate the service, meet legal obligations, resolve
          disputes, and prevent abuse. Account settings let you update profile
          information and visibility; you may also request access, correction,
          or deletion where applicable.
        </p>
      </InformationSection>

      <InformationSection title="Cookies and sessions">
        <p>
          Certfolio uses essential cookies or similar storage for sign-in,
          security, and preferences such as your chosen theme. These are used to
          make the service function, not to build advertising profiles.
        </p>
      </InformationSection>

      <InformationSection title="Questions">
        <p>
          For privacy questions or requests, visit the{" "}
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
