import Link from "next/link"

import { BrandMark } from "@/components/brand-mark"

const footerPages = [
  { href: "/", label: "Home" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/sign-in", label: "Log in" },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70 bg-background px-5 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold text-foreground"
            >
              <BrandMark className="size-7" />
              <span className="text-base tracking-[-0.02em]">Certfolio</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A professional identity platform for technical professionals.
              Bring together your credentials, skills and evidence-backed
              projects in one credible public profile.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Pages
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3">
              {footerPages.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border/70 pt-6">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Certfolio.</p>
            <p>Built for professionals whose work deserves context.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
