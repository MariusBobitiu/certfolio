export type IssuerTheme = {
  cardClassName: string
  logoClassName: string
  badgeClassName: string
  surfaceClassName: string
}

const issuerThemeMap: Record<string, IssuerTheme> = {
  aws: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-zinc-950 via-stone-950 to-slate-900 text-white",
    logoClassName:
      "border-white/12 bg-linear-to-br from-zinc-800 via-zinc-900 to-black text-orange-300",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  comptia: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-red-700 via-rose-700 to-red-800 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  microsoft: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-blue-700 via-indigo-700 to-blue-900 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "google-cloud": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-sky-700 via-cyan-700 to-blue-900 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  cisco: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-cyan-700 via-sky-700 to-blue-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  isc2: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-emerald-700 via-teal-700 to-slate-900 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "offensive-security": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-rose-950 via-red-950 to-zinc-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-red-500/20 via-white/10 to-white/5 text-red-100",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "red-hat": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-red-700 via-red-800 to-zinc-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-red-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "linux-foundation": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-slate-800 via-zinc-900 to-black text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-slate-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  pmi: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-indigo-800 via-fuchsia-800 to-slate-900 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-white/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  tryhackme: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-slate-900 via-zinc-950 to-black text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-red-500/20 via-white/10 to-white/5 text-red-100",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "ec-council": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-amber-700 via-orange-700 to-red-900 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-amber-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  vmware: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-cyan-700 via-blue-800 to-slate-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-cyan-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  oracle: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-red-700 via-red-900 to-zinc-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-red-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  salesforce: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-sky-500 via-blue-600 to-indigo-800 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-sky-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  ibm: {
    cardClassName:
      "border-white/10 bg-linear-to-br from-blue-800 via-indigo-900 to-slate-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-blue-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "pearson-vue": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-emerald-700 via-green-700 to-teal-900 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-emerald-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
  "tcm-security": {
    cardClassName:
      "border-white/10 bg-linear-to-br from-zinc-900 via-slate-900 to-blue-950 text-white",
    logoClassName:
      "border-white/20 bg-linear-to-br from-white/18 via-slate-100/10 to-white/5 text-white",
    badgeClassName:
      "bg-black/18 text-emerald-200 ring-1 ring-white/10",
    surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
  },
}

const fallbackIssuerTheme: IssuerTheme = {
  cardClassName:
    "border-border/70 bg-linear-to-br from-secondary/45 via-card to-primary/5 text-foreground dark:border-white/8 dark:from-secondary/25 dark:via-card/35 dark:to-primary/10",
  logoClassName:
    "border-border/70 bg-card/88 text-foreground dark:border-white/8 dark:bg-white/4",
  badgeClassName:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  surfaceClassName: "border-border/70 bg-card/92 dark:border-white/8",
}

export function getIssuerTheme(themeKey: string | null | undefined) {
  if (!themeKey) {
    return fallbackIssuerTheme
  }

  return issuerThemeMap[themeKey] ?? fallbackIssuerTheme
}

export function getIssuerInitials(displayName: string) {
  const normalized = displayName
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)

  if (normalized.length === 0) {
    return "ID"
  }

  if (normalized.length === 1) {
    return normalized[0].slice(0, 3).toUpperCase()
  }

  return normalized
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
