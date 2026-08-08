import Image from "next/image"

import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center relative",
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/logo.svg"
        alt=""
        unoptimized
				className="size-full object-contain"
        fill
      />
    </span>
  )
}
