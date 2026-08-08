"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useRef } from "react"
import {
  ChevronDown,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AuthSession } from "@/lib/auth/session-core"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/credentials", label: "Credentials" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
] as const

const mobilePrimaryItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/credentials", label: "Credentials" },
] as const

export function Navbar({ session }: { session: AuthSession }) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const signOutFormRef = useRef<HTMLFormElement>(null)

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 p-3 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-7xl">
        {/* Backdrop blur container */}
        <div className="relative flex items-center justify-between rounded-full border border-border/70 bg-background/70 px-6 py-3 shadow-lg backdrop-blur-sm supports-backdrop-filter:bg-background/35 dark:shadow-white/2">
          {/* Logo/Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
          >
            <BrandMark />
            <span className="hidden sm:inline">Certfolio</span>
          </Link>

          {/* Center nav items */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute inset-x-2 -bottom-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/profile"
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/profile"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profile
              {pathname === "/profile" && (
                <span className="absolute inset-x-2 -bottom-3 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-muted"
                  size={"lg"}
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden text-sm font-medium sm:inline">
                    {session.user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* <DropdownMenuItem asChild>
									<Link href='/profile' className='cursor-pointer'>
										<User className='mr-2 h-4 w-4' />
										Profile
									</Link>
								</DropdownMenuItem> */}

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === "dark" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : theme === "light" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Monitor className="mr-2 h-4 w-4" />
                    )}
                    Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive! focus:bg-destructive/10! focus:text-destructive! [&_svg]:text-destructive!"
                  onSelect={() => signOutFormRef.current?.requestSubmit()}
                >
                  <LogOut
                    className="mr-2 h-4 w-4"
                    color={theme === "light" ? "#e7000b" : "#ff6467"}
                  />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              showCloseButton={false}
              className="min-w-screen border-l border-border/70 bg-background/95 p-0 supports-backdrop-filter:backdrop-blur-xl sm:max-w-md"
            >
              <div className="flex h-full flex-col overflow-hidden">
                <div className="border-b border-border/60 bg-linear-to-b from-muted/30 via-background to-background px-5 pt-5 pb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <BrandMark className="size-11 rounded-xl p-1.5" />
                      <div>
                        <SheetTitle className="text-xl leading-tight font-semibold tracking-[-0.03em]">
                          Certfolio
                        </SheetTitle>
                        <SheetDescription className="text-sm leading-tight">
                          {session.user.name}
                        </SheetDescription>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        aria-label="Close navigation menu"
                      >
                        <X className="size-4" />
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="mt-5 rounded-3xl bg-muted/35 px-6 py-3">
                    <p className="max-w-sm text-xl font-semibold tracking-[-0.04em] text-foreground">
                      Navigate your professional workspace.
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between px-5 py-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        Main
                      </p>
                      <div className="space-y-1">
                        {mobilePrimaryItems.map((item) => {
                          const isActive = pathname === item.href

                          return (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={`block border-b-2 p-3 text-lg font-medium transition-colors ${
                                  isActive
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </SheetClose>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        Account
                      </p>
                      <div className="space-y-1">
                        <SheetClose asChild>
                          <Link
                            href="/settings"
                            className={`block border-b-2 px-4 py-3 text-lg font-medium transition-colors ${
                              pathname === "/settings"
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground"
                            }`}
                          >
                            Settings
                          </Link>
                        </SheetClose>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        Appearance
                      </p>
                      <div className="grid grid-cols-3 gap-2 rounded-3xl bg-muted/25 p-1.5">
                        <Button
                          size="sm"
                          variant={theme === "light" ? "secondary" : "ghost"}
                          className="justify-center rounded-2xl"
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </Button>
                        <Button
                          size="sm"
                          variant={theme === "dark" ? "secondary" : "ghost"}
                          className="justify-center rounded-2xl"
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </Button>
                        <Button
                          size="sm"
                          variant={theme === "system" ? "secondary" : "ghost"}
                          className="justify-center rounded-2xl"
                          onClick={() => setTheme("system")}
                        >
                          <Monitor className="mr-2 h-4 w-4" />
                          System
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border/70 pt-4">
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-2xl px-0 text-destructive hover:bg-transparent hover:text-destructive"
                          onClick={() =>
                            signOutFormRef.current?.requestSubmit()
                          }
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {/* Right side - User dropdown */}
          <form
            ref={signOutFormRef}
            action="/api/sign-out"
            method="POST"
            className="hidden"
          />
        </div>
      </div>
    </nav>
  )
}
