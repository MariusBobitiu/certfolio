export function normalizeIssuerName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizeIssuerAliases(aliases: string[]) {
  return [...new Set(aliases.map(normalizeIssuerName).filter(Boolean))]
}
