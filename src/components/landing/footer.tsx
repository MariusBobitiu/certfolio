import Link from "next/link"

const footerPages = [
  { href: "#product", label: "Product" },
  { href: "#example", label: "Example profile" },
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "mailto:hello@certfolio.com", label: "Contact" },
] as const

const footerAccount = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create profile" },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70 bg-background px-5 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                C
              </div>
              <span className="text-base tracking-[-0.02em]">Certfolio</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A professional identity platform for technical professionals.
              Bring together your credentials, skills and evidence-backed
              projects in one credible public profile.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Pages
            </p>
            <ul className="mt-4 space-y-2.5">
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
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Account
            </p>
            <ul className="mt-4 space-y-2.5">
              {footerAccount.map((link) => (
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
          </div>
        </div>

        <div className="mt-12 border-t border-border/70 pt-6">
          <p className="text-xs text-muted-foreground">
            Built for professionals whose work deserves context.
          </p>
        </div>
      </div>
    </footer>
  )
}
