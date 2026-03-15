import { Metadata } from 'next'
import { ProjectsWorkspace } from './projects-workspace'

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

export default function ProjectsPage() {
	return (
		<div className='relative overflow-hidden'>
			<div className='absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,rgba(148,163,184,0.08),transparent_78%)]' />

			<section className='relative rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/55 px-6 py-8 shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_18px_40px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:border-white/8 dark:from-background dark:via-card/30 dark:to-card/40 dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]'>
				<div className='max-w-3xl space-y-6'>
					<div className='inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur'>
						Projects Workspace
					</div>

					<div className='space-y-4'>
						<h2 className='max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl'>
							Shape technical work into credible proof-of-work.
						</h2>
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
								className='rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm text-foreground/85 backdrop-blur dark:border-white/8 dark:bg-white/3'
							>
								{signal}
							</div>
						))}
					</div>
				</div>
			</section>

			<ProjectsWorkspace />
		</div>
	)
}
