import { createHash, randomBytes } from "node:crypto"
import { and, eq, gt, isNull } from "drizzle-orm"
import { db, SessionsTable, UsersTable } from "@/lib/db/drizzle"

export const SESSION_COOKIE_NAME = "cfl_session"

const SESSION_TTL_SECONDS = 60 * 60 * 24
const REMEMBER_ME_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 5

type CreateSessionOptions = {
  rememberMe: boolean
  ipAddress?: string | null
  userAgent?: string | null
}

export type AuthSession = {
  session: typeof SessionsTable.$inferSelect
  user: typeof UsersTable.$inferSelect
}

export function getSessionTtlSeconds(rememberMe: boolean) {
  return rememberMe ? REMEMBER_ME_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url")
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function createSession(
  userId: string,
  options: CreateSessionOptions
) {
  const token = generateSessionToken()
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(
    Date.now() + getSessionTtlSeconds(options.rememberMe) * 1000
  )

  const [session] = await db
    .insert(SessionsTable)
    .values({
      user_id: userId,
      session_token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: options.ipAddress ?? null,
      user_agent: options.userAgent ?? null,
      last_seen_at: new Date(),
    })
    .returning()

  return { token, session }
}

export async function revokeSession(token: string) {
  const tokenHash = hashSessionToken(token)

  await db
    .update(SessionsTable)
    .set({ revoked_at: new Date() })
    .where(eq(SessionsTable.session_token_hash, tokenHash))
}

export async function validateSessionToken(token: string) {
  const tokenHash = hashSessionToken(token)

  const [row] = await db
    .select({
      session: SessionsTable,
      user: UsersTable,
    })
    .from(SessionsTable)
    .innerJoin(UsersTable, eq(SessionsTable.user_id, UsersTable.id))
    .where(
      and(
        eq(SessionsTable.session_token_hash, tokenHash),
        isNull(SessionsTable.revoked_at),
        gt(SessionsTable.expires_at, new Date())
      )
    )
    .limit(1)

  if (!row) {
    return null
  }

  const now = Date.now()
  const lastSeenAt = row.session.last_seen_at?.getTime() ?? 0

  if (now - lastSeenAt >= SESSION_REFRESH_INTERVAL_MS) {
    await db
      .update(SessionsTable)
      .set({ last_seen_at: new Date(now) })
      .where(eq(SessionsTable.id, row.session.id))
  }

  return row satisfies AuthSession
}
