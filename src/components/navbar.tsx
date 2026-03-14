'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useRef } from 'react'
import { ChevronDown, LogOut, Monitor, Moon, Settings, Sun, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dropdown-menu'
import { AuthSession } from '@/lib/auth/session-core'

const navItems = [
	{ href: '/dashboard', label: 'Dashboard' },
	{ href: '/credentials', label: 'Credentials' },
	{ href: '/projects', label: 'Projects' },
] as const

export function Navbar({ session }: { session: AuthSession }) {
	const pathname = usePathname()
	const { setTheme, theme } = useTheme()
	const signOutFormRef = useRef<HTMLFormElement>(null)

	return (
		<nav className='fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-6 sm:py-5'>
			<div className='mx-auto max-w-7xl'>
				{/* Backdrop blur container */}
				<div className='relative flex items-center justify-between rounded-full border border-border/70 bg-background/70 px-6 py-3 shadow-lg dark:shadow-white/2 backdrop-blur-sm supports-backdrop-filter:bg-background/35'>
					{/* Logo/Brand */}
					<Link href='/dashboard' className='flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground'>
							C
						</div>
						<span className='hidden sm:inline'>Certfolio</span>
					</Link>

					{/* Center nav items */}
					<div className='hidden md:flex items-center gap-1'>
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`relative px-4 py-2 text-sm font-medium transition-colors ${
									pathname === item.href
										? 'text-foreground'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								{item.label}
								{pathname === item.href && (
									<span className='absolute inset-x-2 -bottom-3 h-0.5 rounded-full bg-primary' />
								)}
							</Link>
						))}
					</div>

					{/* Right side - User dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								className='flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-muted'
							>
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
									{session.user.name?.charAt(0).toUpperCase() || 'U'}
								</div>
								<span className='hidden text-sm font-medium sm:inline'>
									{session.user.name}
								</span>
								<ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className='w-56'>
							<DropdownMenuLabel className='font-normal'>
								<div className='flex flex-col gap-1'>
									<p className='text-sm font-medium'>{session.user.name}</p>
									<p className='text-xs text-muted-foreground truncate'>
										{session.user.email}
									</p>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuItem asChild>
								<Link href='/profile' className='cursor-pointer'>
									<User className='mr-2 h-4 w-4' />
									Profile
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link href='/settings' className='cursor-pointer'>
									<Settings className='mr-2 h-4 w-4' />
									Settings
								</Link>
							</DropdownMenuItem>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									{theme === 'dark' ? (
										<Moon className='mr-2 h-4 w-4' />
									) : theme === 'light' ? (
										<Sun className='mr-2 h-4 w-4' />
									) : (
										<Monitor className='mr-2 h-4 w-4' />
									)}
									Theme
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem onClick={() => setTheme('light')}>
										<Sun className='mr-2 h-4 w-4' />
										Light
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme('dark')}>
										<Moon className='mr-2 h-4 w-4' />
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme('system')}>
										<Monitor className='mr-2 h-4 w-4' />
										System
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								className='text-destructive! focus:bg-destructive/10! focus:text-destructive! [&_svg]:text-destructive!'
								onSelect={() => signOutFormRef.current?.requestSubmit()}
							>
								<LogOut className='mr-2 h-4 w-4' color={theme === "light" ? "#e7000b" : "#ff6467"} />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<form ref={signOutFormRef} action='/api/sign-out' method='POST' className='hidden' />
				</div>
			</div>
		</nav>
	)
}
