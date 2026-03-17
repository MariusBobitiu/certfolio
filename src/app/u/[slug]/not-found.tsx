import Link from "next/link"

export default function ProfileNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-5xl font-semibold tracking-[-0.04em] text-foreground/20">
          404
        </p>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Profile not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This profile doesn&apos;t exist or the link may be incorrect.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to Certfolio
        </Link>
      </div>
    </main>
  )
}
