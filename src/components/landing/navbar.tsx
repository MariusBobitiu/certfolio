"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#example", label: "Example profile" },
] as const

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileOpen(false)
      }
      document.addEventListener("keydown", onKeyDown)
      return () => {
        document.body.style.overflow = ""
        document.removeEventListener("keydown", onKeyDown)
      }
    }
    document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo — references the trust seal with a circular ring mark */}
        <Link
          href="/"
          className="group flex items-center gap-3 font-semibold text-foreground transition-opacity hover:opacity-85"
        >
          <div className="relative flex size-8 items-center justify-center">
            {/* Subtle outer ring referencing the seal */}
            <div className="absolute inset-0 rounded-full border border-primary/25 transition-colors group-hover:border-primary/40" />
            {/* Inner filled mark */}
            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
              C
            </div>
          </div>
          <span className="text-[15px] tracking-[-0.03em]">Certfolio</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/sign-in"
            className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="h-8.5 text-[13px]">
            <Link href="/sign-up">Create your profile</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/8 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute right-0 top-0 h-full w-72 animate-in slide-in-from-right-5 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex size-8 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-primary/25" />
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    C
                  </div>
                </div>
                <span className="text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                  Certfolio
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col px-5 py-5" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border/50 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-7 flex flex-col gap-2.5">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Create your profile
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
