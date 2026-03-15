import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main
			className='relative flex min-h-svh items-center justify-center overflow-y-auto overflow-x-hidden bg-linear-to-br from-zinc-50 via-sky-50 to-blue-100 px-4 py-4 sm:min-h-screen sm:px-6 sm:py-10 dark:from-zinc-950 dark:via-zinc-900 dark:to-[rgba(0,90,138,0.12)]'
		>
			<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,90,138,0.12),transparent_45%)]' />
			<div className='relative w-full max-w-lg rounded-2xl border border-border/70 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-8'>
				{children}
			</div>
		</main>
  );
}
