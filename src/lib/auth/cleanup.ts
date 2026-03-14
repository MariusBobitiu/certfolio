import "server-only"

import { and, isNotNull, isNull, lt, or } from "drizzle-orm"

import {
  AuthRateLimitsTable,
  db,
  SessionsTable,
  TrustedMfaDevicesTable,
  VerificationsTable,
} from "@/lib/db/drizzle"

export async function cleanupExpiredAuthRecords() {
  const now = new Date()
  const rateLimitCutoff = new Date(now.getTime() - 1000 * 60 * 60 * 24)
  const verificationCutoff = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)

  return db.transaction(async (tx) => {
    const [expiredSessions, expiredTrustedDevices, staleRateLimits, oldVerifications] =
      await Promise.all([
        tx
          .delete(SessionsTable)
          .where(or(lt(SessionsTable.expires_at, now), isNotNull(SessionsTable.revoked_at)))
          .returning({ id: SessionsTable.id }),
        tx
          .delete(TrustedMfaDevicesTable)
          .where(
            or(
              lt(TrustedMfaDevicesTable.expires_at, now),
              isNotNull(TrustedMfaDevicesTable.revoked_at)
            )
          )
          .returning({ id: TrustedMfaDevicesTable.id }),
        tx
          .delete(AuthRateLimitsTable)
          .where(
            and(
              lt(AuthRateLimitsTable.updated_at, rateLimitCutoff),
              or(
                lt(AuthRateLimitsTable.blocked_until, now),
                isNull(AuthRateLimitsTable.blocked_until)
              )
            )
          )
          .returning({ id: AuthRateLimitsTable.id }),
        tx
          .delete(VerificationsTable)
          .where(
            and(
              lt(VerificationsTable.expires_at, verificationCutoff),
              isNotNull(VerificationsTable.consumed_at)
            )
          )
          .returning({ id: VerificationsTable.id }),
      ])

    return {
      deletedSessions: expiredSessions.length,
      deletedTrustedDevices: expiredTrustedDevices.length,
      deletedRateLimits: staleRateLimits.length,
      deletedVerifications: oldVerifications.length,
    }
  })
}
