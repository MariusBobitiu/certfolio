import "server-only"

import { createHash } from "node:crypto"
import { and, eq } from "drizzle-orm"

import { db, AuthRateLimitsTable } from "@/lib/db/drizzle"

type ConsumeRateLimitParams = {
  scope: string
  key: string
  maxAttempts: number
  windowMs: number
}

function hashRateLimitKey(scope: string, key: string) {
  return createHash("sha256").update(`${scope}:${key}`).digest("hex")
}

export async function consumeRateLimit(params: ConsumeRateLimitParams) {
  const now = new Date()
  const keyHash = hashRateLimitKey(params.scope, params.key)

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(AuthRateLimitsTable)
      .where(
        and(
          eq(AuthRateLimitsTable.scope, params.scope),
          eq(AuthRateLimitsTable.key_hash, keyHash)
        )
      )
      .limit(1)

    if (!existing) {
      await tx.insert(AuthRateLimitsTable).values({
        scope: params.scope,
        key_hash: keyHash,
        attempts: 1,
        window_started_at: now,
        updated_at: now,
      })

      return { allowed: true as const }
    }

    if (existing.blocked_until && existing.blocked_until > now) {
      return {
        allowed: false as const,
        retryAt: existing.blocked_until,
      }
    }

    const windowExpired =
      now.getTime() - existing.window_started_at.getTime() >= params.windowMs

    if (windowExpired) {
      await tx
        .update(AuthRateLimitsTable)
        .set({
          attempts: 1,
          window_started_at: now,
          blocked_until: null,
          updated_at: now,
        })
        .where(eq(AuthRateLimitsTable.id, existing.id))

      return { allowed: true as const }
    }

    const nextAttempts = existing.attempts + 1

    if (nextAttempts > params.maxAttempts) {
      const retryAt = new Date(existing.window_started_at.getTime() + params.windowMs)

      await tx
        .update(AuthRateLimitsTable)
        .set({
          attempts: nextAttempts,
          blocked_until: retryAt,
          updated_at: now,
        })
        .where(eq(AuthRateLimitsTable.id, existing.id))

      return {
        allowed: false as const,
        retryAt,
      }
    }

    await tx
      .update(AuthRateLimitsTable)
      .set({
        attempts: nextAttempts,
        blocked_until: null,
        updated_at: now,
      })
      .where(eq(AuthRateLimitsTable.id, existing.id))

    return { allowed: true as const }
  })
}

export async function resetRateLimit(scope: string, key: string) {
  const keyHash = hashRateLimitKey(scope, key)

  await db
    .delete(AuthRateLimitsTable)
    .where(
      and(
        eq(AuthRateLimitsTable.scope, scope),
        eq(AuthRateLimitsTable.key_hash, keyHash)
      )
    )
}
