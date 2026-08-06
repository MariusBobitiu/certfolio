import { CheckIcon } from "lucide-react";

export function RecognitionStrip() {
  return (
    <section className="border-y border-border/70 bg-secondary/30 px-5 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-medium text-muted-foreground sm:text-base">
          Credentials establish trust. Projects demonstrate ability. Certfolio connects both.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {[
            "Verified credentials",
            "Project evidence",
            "Professional profile",
            "Shareable identity",
          ].map((label) => (
            <span
              key={label}
              className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase p-2 rounded-xl border border-border px-4"
						>
							<CheckIcon className="size-2.5 text-foreground inline mr-2" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
