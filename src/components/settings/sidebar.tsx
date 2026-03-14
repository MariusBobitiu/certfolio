"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  User,
  Shield,
  Link2,
  Bell,
  Palette,
  Eye,
  Database,
} from "lucide-react"

const SIDEBAR_GROUPS = [
  {
    label: "Account",
    items: [
      { label: "General", hash: "general", icon: User },
      { label: "Security", hash: "security", icon: Shield },
      { label: "Connected Accounts", hash: "connected-accounts", icon: Link2 },
      { label: "Notifications", hash: "notifications", icon: Bell },
    ],
  },
  {
    label: "Preferences",
    items: [
      { label: "Appearance", hash: "appearance", icon: Palette },
      { label: "Privacy & Visibility", hash: "privacy", icon: Eye },
      { label: "Data & Account", hash: "data", icon: Database },
    ],
  },
] as const

const ALL_HASHES = SIDEBAR_GROUPS.flatMap((g) => g.items.map((i) => i.hash))

export function SettingsSidebar() {
  const [activeHash, setActiveHash] = useState("general")
  const isClickScrolling = useRef(false)
  const clickTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  // IntersectionObserver to track which section is in view
  useEffect(() => {
    const sections = ALL_HASHES
      .map((hash) => document.getElementById(hash))
      .filter(Boolean) as HTMLElement[]

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip observer updates while a click-initiated scroll is in progress
        if (isClickScrolling.current) return

        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          const id = visible[0].target.id
          setActiveHash(id)
          history.replaceState(null, "", `#${id}`)
        }
      },
      {
        // Offset top by navbar height, observe when section crosses into view
        rootMargin: "-144px 0px -35% 0px",
        threshold: 0,
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // On mount, scroll to the hash in the URL if present
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (hash) {
      setActiveHash(hash)
      // Small delay to ensure sections are rendered
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" })
      })
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault()
      setActiveHash(hash)
      history.replaceState(null, "", `#${hash}`)

      // Flag that we're doing a click-scroll so the observer doesn't fight us
      isClickScrolling.current = true
      if (clickTimeout.current) clearTimeout(clickTimeout.current)

      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" })

      // Re-enable observer after scroll settles
      clickTimeout.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 800)
    },
    []
  )

  return (
    <nav className="w-full lg:w-56 lg:shrink-0">
      <div className="lg:sticky lg:top-28 space-y-6">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeHash === item.hash
                return (
                  <li key={item.hash}>
                    <a
                      href={`#${item.hash}`}
                      onClick={(e) => handleClick(e, item.hash)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
