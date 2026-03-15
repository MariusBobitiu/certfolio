import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
	title: 'Projects - Certfolio',
	description: 'Build a proof-backed project portfolio that reflects your professional identity on Certfolio.',
	authors: [{
		name: 'Marius Bobitiu',
		url: 'https://mariusbobitiu.dev',
	}],
}

const foundationSignals = [
	'Proof-backed professional work',
	'Reusable on your public profile later',
	'Structured for outcomes, context, and evidence',
] as const

const futureSections = [
	{
		eyebrow: 'Header',
		title: 'Page introduction and primary action',
		description: 'This area will carry the Projects positioning, profile-ready summary, and the main entry point for adding a new project.',
	},
	{
		eyebrow: 'Workspace',
		title: 'Projects collection and filtering surface',
		description: 'This region is reserved for the project list, grouping controls, and future quality signals without forcing a data model yet.',
	},
	{
		eyebrow: 'Detail',
		title: 'Focused project storytelling surface',
		description: 'A dedicated area for richer project detail and editing will plug into this shell in later phases.',
	},
] as const

export default function ProjectsPage() {
	return (
		<div className='relative overflow-hidden'>
			<div className='absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_rgba(148,163,184,0.08),_transparent_78%)]' />

			<section className='relative rounded-4xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/30 px-6 py-8 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset] sm:px-8 sm:py-10 lg:px-10 lg:py-12'>
				<div className='max-w-3xl space-y-6'>
					<div className='inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur'>
						Projects Workspace
					</div>

					<div className='space-y-4'>
						<h1 className='max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl'>
							Shape technical work into credible proof-of-work.
						</h1>
						<p className='max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg'>
							Certfolio projects are meant to hold more than a title and a screenshot.
							This workspace is being structured for context, outcomes, evidence, and
							future profile reuse.
						</p>
					</div>

					<div className='flex flex-wrap gap-3'>
						{foundationSignals.map((signal) => (
							<div
								key={signal}
								className='rounded-full border border-border/70 bg-background/75 px-4 py-2 text-sm text-foreground/85 backdrop-blur'
							>
								{signal}
							</div>
						))}
					</div>
				</div>
			</section>

			<section className='mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]'>
				<div className='rounded-4xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8'>
					<div className='space-y-3 border-b border-border/60 pb-5'>
						<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
							Collection Surface
						</p>
						<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
							Foundation for the projects workspace
						</h2>
						<p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
							Phase 1 keeps this space intentionally structural. The page now has a
							clear content hierarchy and room for listing, creation entry points, and
							project quality guidance without forcing premature implementation choices.
						</p>
					</div>

					<div className='mt-6 grid gap-4 md:grid-cols-3'>
						{futureSections.map((section) => (
							<article
								key={section.title}
								className='rounded-3xl border border-border/60 bg-background/70 p-5'
							>
								<p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
									{section.eyebrow}
								</p>
								<h3 className='mt-3 text-base font-semibold leading-6'>{section.title}</h3>
								<p className='mt-3 text-sm leading-6 text-muted-foreground'>
									{section.description}
								</p>
							</article>
						))}
					</div>
				</div>

				<aside className='rounded-4xl border border-border/60 bg-card/75 p-6 shadow-sm backdrop-blur sm:p-8'>
					<div className='space-y-3'>
						<p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
							Editorial Direction
						</p>
						<h2 className='text-2xl font-semibold tracking-[-0.03em]'>
							Premium, calm, and credibility-first
						</h2>
						<p className='text-sm leading-6 text-muted-foreground sm:text-base'>
							The Projects page is being framed as a professional identity surface, not
							an admin dashboard. Later phases can add actions and data without changing
							this page’s visual hierarchy.
						</p>
					</div>

					<div className='mt-6 space-y-4'>
						<div className='rounded-3xl border border-border/60 bg-background/70 p-5'>
							<p className='text-sm font-medium text-foreground'>What this phase establishes</p>
							<p className='mt-2 text-sm leading-6 text-muted-foreground'>
								A durable hero, sectional rhythm, and visual direction that can absorb
								empty states, project cards, and detail flows incrementally.
							</p>
						</div>

						<div className='rounded-3xl border border-dashed border-border/70 bg-muted/30 p-5'>
							<p className='text-sm font-medium text-foreground'>Intentionally deferred</p>
							<p className='mt-2 text-sm leading-6 text-muted-foreground'>
								Create actions, project data, evidence capture, filters, and editing
								behavior remain out of scope for this first pass.
							</p>
						</div>
					</div>
				</aside>
			</section>
		</div>
	)
}
