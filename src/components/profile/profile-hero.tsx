import Image from "next/image"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileHero({
  name,
  image,
  slug,
}: {
  name: string
  image: string
  slug: string
}) {
  const hasImage = Boolean(image)

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      {/* Avatar */}
      <div className="shrink-0">
        {hasImage ? (
          <Image
            unoptimized
            src={image}
            alt={name}
            width={88}
            height={88}
            className="size-[88px] rounded-full border-2 border-border/60 object-cover shadow-sm dark:border-white/10"
          />
        ) : (
          <div className="flex size-[88px] items-center justify-center rounded-full border-2 border-border/60 bg-linear-to-br from-primary/20 via-secondary to-card text-2xl font-semibold tracking-tight text-foreground shadow-sm dark:border-white/10">
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          {name}
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          @{slug}
        </p>
      </div>
    </div>
  )
}
