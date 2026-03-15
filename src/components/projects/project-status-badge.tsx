import { cn } from '@/lib/utils'

type ProjectStatus = 'draft' | 'published' | 'archived'

const statusToneMap: Record<ProjectStatus, string> = {
	draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
	published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
	archived: 'bg-muted text-muted-foreground',
}

export function getProjectStatusTone(status: ProjectStatus) {
	return statusToneMap[status]
}

export function ProjectStatusBadge({
	status,
	className,
}: {
	status: ProjectStatus
	className?: string
}) {
	return (
		<div
			className={cn(
				'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
				getProjectStatusTone(status),
				className,
			)}
		>
			{status}
		</div>
	)
}
