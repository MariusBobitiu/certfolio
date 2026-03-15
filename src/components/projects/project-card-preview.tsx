import type { Route } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { CustomBadge } from '@/components/custom-badge'
import { cn } from '@/lib/utils'

import { ProjectStatusBadge } from './project-status-badge'

type ProjectStatus = 'draft' | 'published' | 'archived'

type ProjectCardPreviewProps = {
	eyebrow: string
	title: string
	summary: string
	projectType: string
	role: string
	status: ProjectStatus
	context?: string
	outcome?: string
	tools?: string
	evidenceCount?: number
	variant?: 'listing' | 'preview'
	href?: Route
	className?: string
}

export function ProjectCardPreview({
	eyebrow,
	title,
	summary,
	projectType,
	role,
	status,
	context = '',
	outcome = '',
	tools = '',
	evidenceCount = 0,
	variant = 'listing',
	href,
	className,
}: ProjectCardPreviewProps) {
	const isPreview = variant === 'preview'
	const hasProofSignals = Boolean(context || outcome || tools || evidenceCount > 0)
	const proofSignals = [
		context ? 'Context' : null,
		outcome ? 'Outcome' : null,
		tools ? 'Stack' : null,
		evidenceCount > 0
			? `${evidenceCount} evidence`
			: null,
	].filter(Boolean) as string[]

	return (
		<article
			className={cn(
				'flex flex-col rounded-3xl border border-border/70 bg-linear-to-br from-secondary/55 via-card to-primary/5 p-5 dark:border-white/7 dark:from-secondary/30 dark:via-card/30 dark:to-primary/10',
				isPreview ? 'min-h-0' : 'group h-full min-h-112 transition-colors hover:border-border/90',
				className,
			)}
		>
			<div className='space-y-4'>
				<div className='flex items-center justify-between gap-3'>
					<div className='inline-flex items-center rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:border-white/8 dark:bg-white/4'>
						{eyebrow}
					</div>
					<ProjectStatusBadge status={status} />
				</div>

				<div className='space-y-3'>
					{href ? (
						<Link
							href={href}
							className='line-clamp-2 min-h-16 text-2xl font-semibold tracking-[-0.04em] text-foreground transition-opacity hover:opacity-80'
						>
							{title}
						</Link>
					) : (
						<h3
							className={cn(
								'font-semibold tracking-[-0.04em] text-balance text-foreground',
								isPreview ? 'text-3xl sm:line-clamp-2 sm:min-h-12' : 'line-clamp-2 min-h-18 text-2xl',
							)}
						>
							{title}
						</h3>
					)}

					<p
						className={cn(
							'text-sm leading-7 text-muted-foreground',
							isPreview ? 'sm:line-clamp-5 sm:min-h-32' : 'line-clamp-4 min-h-32',
						)}
					>
						{summary}
					</p>
				</div>
			</div>

			<div className='mt-6 flex flex-wrap content-start gap-2'>
				<CustomBadge label='Type' value={projectType} />
				<CustomBadge label='Role' value={role} />
			</div>

			{!isPreview && hasProofSignals ? (
				<div className='mt-5 border-t border-border/50 pt-4 dark:border-white/8'>
					<p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
						Proof signals
					</p>
					<div className='mt-2 flex flex-wrap gap-x-3 gap-y-2'>
					{proofSignals.map((signal) => (
						<div
							key={signal}
							className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'
						>
							<div className='size-1.5 rounded-full bg-primary/70' />
							{signal}
						</div>
					))}
					</div>
				</div>
			) : null}

			<div className={cn(isPreview ? 'pt-6' : 'mt-auto pt-4')}>
				{href ? (
					<Link
						href={href}
						className='inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline'
					>
						Open project
						<ArrowUpRight className='size-4' />
					</Link>
				) : (
					<p className='text-sm font-medium text-primary'>
						How this card would read to someone else
					</p>
				)}
			</div>
		</article>
	)
}
