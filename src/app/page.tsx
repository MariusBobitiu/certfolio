import { LandingNavbar } from "@/components/landing/navbar"
import { LandingHero } from "@/components/landing/hero"
import { RecognitionStrip } from "@/components/landing/recognition-strip"
import { ProblemSection } from "@/components/landing/problem-section"
import { ProductDemo } from "@/components/landing/product-demo"
import { EvidenceSection } from "@/components/landing/evidence-section"
import { CredentialSection } from "@/components/landing/credential-section"
import { AudienceSection } from "@/components/landing/audience-section"
import { ExampleProfile } from "@/components/landing/example-profile"
import { FinalCTA } from "@/components/landing/final-cta"
import { LandingFooter } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <LandingNavbar />
      <main>
        <LandingHero />
        <RecognitionStrip />
        <ProblemSection />
        <ProductDemo />
        <EvidenceSection />
        <CredentialSection />
        <AudienceSection />
        <ExampleProfile />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
