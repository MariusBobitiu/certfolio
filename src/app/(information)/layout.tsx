import type { ReactNode } from "react"

import { LandingFooter } from "@/components/landing/footer"
import { LandingNavbar } from "@/components/landing/navbar"

export default function InformationLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  )
}
