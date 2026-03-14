import "server-only"

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto"
import { cookies } from "next/headers"
import {
  and,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  lt,
  ne,
  or,
} from "drizzle-orm"
import { hash as hashSecret, verify as verifySecret } from "@node-rs/argon2"
import { Resend } from "resend"

import {
  BASE32_ALPHABET,
  EMAIL_MFA_MAX_ATTEMPTS,
  EMAIL_MFA_RESEND_INTERVAL_MS,
  MFA_CHALLENGE_TTL_MS,
  MFA_PENDING_COOKIE_NAME,
  RECOVERY_CODE_ALPHABET,
  RECOVERY_CODE_COUNT,
  RECOVERY_CODE_SEGMENT_LENGTH,
  TOTP_ALGORITHM,
  TOTP_DIGITS,
  TOTP_ENCRYPTION_ALGORITHM,
  TOTP_ENCRYPTION_VERSION,
  TOTP_ISSUER,
  TOTP_MFA_MAX_ATTEMPTS,
  TOTP_PERIOD_SECONDS,
  TOTP_SECRET_BYTES,
  TOTP_WINDOW,
} from "@/lib/consts"
import {
  db,
  UserMfaMethodsTable,
  UserRecoveryCodesTable,
  UsersTable,
  VerificationsTable,
} from "@/lib/db/drizzle"

type PendingMfaState = {
  method: "email" | "totp"
  userId: string
  verificationId: string
}

type MfaChallengeMetadata = {
  rememberMe?: boolean
  ipAddress?: string | null
  city?: string | null
  userAgent?: string | null
}

type IssueEmailMfaChallengeParams = {
  userId: string
  email: string
  name: string
  rememberMe: boolean
  ipAddress?: string | null
  city?: string | null
  userAgent?: string | null
}

type IssueTotpMfaChallengeParams = {
  userId: string
  rememberMe: boolean
  ipAddress?: string | null
  city?: string | null
  userAgent?: string | null
}

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  )
}

function getTotpEncryptionKey() {
  const rawKey =
    process.env.MFA_TOTP_ENCRYPTION_KEY ??
    process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

  if (!rawKey) {
    throw new Error(
      "MFA_TOTP_ENCRYPTION_KEY is required to encrypt TOTP secrets."
    )
  }

  const key = Buffer.from(rawKey, "base64")

  if (key.length !== 32) {
    throw new Error(
      "MFA_TOTP_ENCRYPTION_KEY must decode to exactly 32 bytes."
    )
  }

  return key
}

function getTotpAccountName(email: string) {
  return email
}

function hashVerificationCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

function generateVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0")
}

function normalizeRecoveryCode(code: string) {
  return code.replace(/[\s-]/g, "").toUpperCase()
}

function generateRecoveryCode() {
  let output = ""

  for (let index = 0; index < RECOVERY_CODE_SEGMENT_LENGTH * 2; index += 1) {
    output +=
      RECOVERY_CODE_ALPHABET[
        randomInt(0, RECOVERY_CODE_ALPHABET.length)
      ]
  }

  return `${output.slice(0, RECOVERY_CODE_SEGMENT_LENGTH)}-${output.slice(
    RECOVERY_CODE_SEGMENT_LENGTH
  )}`
}

function encodePendingMfaState(state: PendingMfaState) {
  return Buffer.from(JSON.stringify(state)).toString("base64url")
}

function decodePendingMfaState(value: string): PendingMfaState | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"))

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed.method !== "email" && parsed.method !== "totp") ||
      typeof parsed.userId !== "string" ||
      typeof parsed.verificationId !== "string"
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function getEmailMfaMask(email: string) {
  const [localPart, domain] = email.split("@")

  if (!localPart || !domain) {
    return email
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}*@${domain}`
  }

  return `${localPart.slice(0, 2)}${"*".repeat(
    Math.max(1, localPart.length - 2)
  )}@${domain}`
}

function base32Encode(buffer: Buffer) {
  let bits = 0
  let value = 0
  let output = ""

  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

function base32Decode(input: string) {
  const normalized = input.replace(/[\s-]/g, "").toUpperCase()

  if (!normalized || /[^A-Z2-7]/.test(normalized)) {
    throw new Error("Invalid TOTP secret encoding.")
  }

  let bits = 0
  let value = 0
  const output: number[] = []

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char)

    if (index === -1) {
      throw new Error("Invalid TOTP secret encoding.")
    }

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(output)
}

function getTotpCounterForTime(timeMs: number, periodSeconds: number) {
  return Math.floor(timeMs / 1000 / periodSeconds)
}

function generateTotpCode(params: {
  secret: string
  counter: number
  digits?: number
  algorithm?: string
}) {
  const secret = base32Decode(params.secret)
  const counterBuffer = Buffer.alloc(8)
  const high = Math.floor(params.counter / 0x100000000)
  const low = params.counter % 0x100000000

  counterBuffer.writeUInt32BE(high, 0)
  counterBuffer.writeUInt32BE(low, 4)

  const digest = createHmac(
    params.algorithm?.toLowerCase() ?? TOTP_ALGORITHM.toLowerCase(),
    secret
  )
    .update(counterBuffer)
    .digest()
  const offset = digest[digest.length - 1] & 0x0f
  const binaryCode =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)

  return (binaryCode % 10 ** (params.digits ?? TOTP_DIGITS))
    .toString()
    .padStart(params.digits ?? TOTP_DIGITS, "0")
}

function codesEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function encryptTotpSecret(secret: string, userId: string) {
  const key = getTotpEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(TOTP_ENCRYPTION_ALGORITHM, key, iv)

  cipher.setAAD(Buffer.from(`${userId}:totp`))

  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    version: TOTP_ENCRYPTION_VERSION,
  }
}

function decryptTotpSecret(params: {
  userId: string
  ciphertext: string | null
  iv: string | null
  authTag: string | null
}) {
  if (!params.ciphertext || !params.iv || !params.authTag) {
    throw new Error("Stored TOTP secret is incomplete.")
  }

  const key = getTotpEncryptionKey()
  const decipher = createDecipheriv(
    TOTP_ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(params.iv, "base64")
  )

  decipher.setAAD(Buffer.from(`${params.userId}:totp`))
  decipher.setAuthTag(Buffer.from(params.authTag, "base64"))

  return Buffer.concat([
    decipher.update(Buffer.from(params.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8")
}

function findValidTotpCounter(params: {
  code: string
  secret: string
  lastUsedCounter: number | null
  digits: number
  algorithm: string
  periodSeconds: number
}) {
  const nowCounter = getTotpCounterForTime(Date.now(), params.periodSeconds)

  for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset += 1) {
    const counter = nowCounter + offset

    if (counter < 0) {
      continue
    }

    if (
      params.lastUsedCounter !== null &&
      counter <= params.lastUsedCounter
    ) {
      continue
    }

    const expectedCode = generateTotpCode({
      secret: params.secret,
      counter,
      digits: params.digits,
      algorithm: params.algorithm,
    })

    if (codesEqual(expectedCode, params.code)) {
      return counter
    }
  }

  return null
}

function buildTotpChallengeMetadata(
  params:
    | IssueEmailMfaChallengeParams
    | IssueTotpMfaChallengeParams
): MfaChallengeMetadata {
  return {
    rememberMe: params.rememberMe,
    ipAddress: params.ipAddress ?? null,
    city: params.city ?? null,
    userAgent: params.userAgent ?? null,
  }
}

async function sendEmailMfaCodeEmail(params: {
  email: string
  name: string
  code: string
}) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. MFA email was not sent.")
    return
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.EMAIL_FROM ??
    (process.env.RESEND_EMAIL_FROM_DOMAIN
      ? `Certfolio <onboarding@${process.env.RESEND_EMAIL_FROM_DOMAIN}>`
      : "Certfolio <onboarding@resend.dev>")

  const mfaUrl = new URL("/mfa", getBaseUrl()).toString()

  const { error } = await resend.emails.send({
    from,
    to: params.email,
    subject: "Your Certfolio verification code",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Your verification code</h2>
        <p style="margin: 0 0 16px;">Hi ${params.name}, use this code to finish signing in to Certfolio:</p>
        <p style="margin: 0 0 20px; font-size: 32px; font-weight: 700; letter-spacing: 0.3em;">${params.code}</p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">This code expires in 10 minutes. If you did not start this sign-in, you can ignore this email.</p>
        <p style="margin: 0; font-size: 14px;"><a href="${mfaUrl}">Return to Certfolio</a></p>
      </div>
    `,
    text: `Hi ${params.name}, your Certfolio verification code is ${params.code}. It expires in 10 minutes. Return to ${mfaUrl} to complete sign-in.`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function promoteLatestActiveMethod(tx: DbTransaction, userId: string) {
  const [fallbackMethod] = await tx
    .select({ id: UserMfaMethodsTable.id })
    .from(UserMfaMethodsTable)
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, userId),
        isNotNull(UserMfaMethodsTable.enabled_at),
        isNull(UserMfaMethodsTable.disabled_at)
      )
    )
    .orderBy(desc(UserMfaMethodsTable.verified_at), desc(UserMfaMethodsTable.created_at))
    .limit(1)

  if (!fallbackMethod) {
    return
  }

  await tx
    .update(UserMfaMethodsTable)
    .set({ is_primary: true, updated_at: new Date() })
    .where(eq(UserMfaMethodsTable.id, fallbackMethod.id))
}

export async function getEnabledMfaMethods(userId: string) {
  return db
    .select()
    .from(UserMfaMethodsTable)
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, userId),
        isNotNull(UserMfaMethodsTable.enabled_at),
        isNull(UserMfaMethodsTable.disabled_at)
      )
    )
    .orderBy(
      desc(UserMfaMethodsTable.is_primary),
      desc(UserMfaMethodsTable.created_at)
    )
}

export async function getMfaMethodSummary(userId: string) {
  const [methods, recoveryCodes] = await Promise.all([
    db
      .select({
        method: UserMfaMethodsTable.method,
        enabled_at: UserMfaMethodsTable.enabled_at,
        disabled_at: UserMfaMethodsTable.disabled_at,
      })
      .from(UserMfaMethodsTable)
      .where(eq(UserMfaMethodsTable.user_id, userId)),
    db
      .select({
        id: UserRecoveryCodesTable.id,
        used_at: UserRecoveryCodesTable.used_at,
      })
      .from(UserRecoveryCodesTable)
      .where(eq(UserRecoveryCodesTable.user_id, userId)),
  ])

  const activeMethods = methods.filter(
    (method) => method.enabled_at && !method.disabled_at
  )
  const unusedRecoveryCodeCount = recoveryCodes.filter(
    (code) => !code.used_at
  ).length

  return {
    emailEnabled: activeMethods.some((method) => method.method === "email"),
    totpEnabled: activeMethods.some((method) => method.method === "totp"),
    activeMethodCount: activeMethods.length,
    recoveryCodesEnabled: recoveryCodes.length > 0,
    recoveryCodesRemaining: unusedRecoveryCodeCount,
  }
}

export async function enableEmailMfaMethod(userId: string) {
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(UserMfaMethodsTable)
      .set({ is_primary: false, updated_at: now })
      .where(eq(UserMfaMethodsTable.user_id, userId))

    const [existing] = await tx
      .select()
      .from(UserMfaMethodsTable)
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, userId),
          eq(UserMfaMethodsTable.method, "email")
        )
      )
      .limit(1)

    if (existing) {
      await tx
        .update(UserMfaMethodsTable)
        .set({
          label: "Email code",
          is_primary: true,
          enabled_at: now,
          verified_at: existing.verified_at ?? now,
          disabled_at: null,
          updated_at: now,
        })
        .where(eq(UserMfaMethodsTable.id, existing.id))
    } else {
      await tx.insert(UserMfaMethodsTable).values({
        user_id: userId,
        method: "email",
        label: "Email code",
        is_primary: true,
        enabled_at: now,
        verified_at: now,
      })
    }

    await tx.insert(VerificationsTable).values({
      user_id: userId,
      purpose: "mfa_enrollment",
      method: "email",
      expires_at: now,
      consumed_at: now,
      metadata: { enrolled: true },
    })
  })
}

export async function disableEmailMfaMethod(userId: string) {
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(UserMfaMethodsTable)
      .set({
        is_primary: false,
        disabled_at: now,
        updated_at: now,
      })
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, userId),
          eq(UserMfaMethodsTable.method, "email"),
          isNull(UserMfaMethodsTable.disabled_at)
        )
      )

    await promoteLatestActiveMethod(tx, userId)
  })
}

export async function beginTotpEnrollment(params: {
  userId: string
  email: string
}) {
  const now = new Date()
  const [existing] = await db
    .select()
    .from(UserMfaMethodsTable)
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, params.userId),
        eq(UserMfaMethodsTable.method, "totp")
      )
    )
    .limit(1)

  if (existing?.enabled_at && !existing.disabled_at) {
    return {
      success: false as const,
      failure: "Authenticator app MFA is already enabled.",
    }
  }

  const secret = base32Encode(randomBytes(TOTP_SECRET_BYTES))
  const encryptedSecret = encryptTotpSecret(secret, params.userId)
  const accountName = getTotpAccountName(params.email)
  const otpauthUrl =
    `otpauth://totp/${encodeURIComponent(
      `${TOTP_ISSUER}:${accountName}`
    )}` +
    `?secret=${encodeURIComponent(secret)}` +
    `&issuer=${encodeURIComponent(TOTP_ISSUER)}` +
    `&algorithm=${encodeURIComponent(TOTP_ALGORITHM)}` +
    `&digits=${TOTP_DIGITS}` +
    `&period=${TOTP_PERIOD_SECONDS}`

  if (existing) {
    await db
      .update(UserMfaMethodsTable)
      .set({
        label: "Authenticator app",
        secret_ciphertext: encryptedSecret.ciphertext,
        secret_iv: encryptedSecret.iv,
        secret_auth_tag: encryptedSecret.authTag,
        secret_version: encryptedSecret.version,
        algorithm: TOTP_ALGORITHM,
        digits: TOTP_DIGITS,
        period_seconds: TOTP_PERIOD_SECONDS,
        enabled_at: null,
        verified_at: null,
        last_used_at: null,
        last_used_counter: null,
        disabled_at: null,
        updated_at: now,
      })
      .where(eq(UserMfaMethodsTable.id, existing.id))
  } else {
    await db.insert(UserMfaMethodsTable).values({
      user_id: params.userId,
      method: "totp",
      label: "Authenticator app",
      is_primary: false,
      secret_ciphertext: encryptedSecret.ciphertext,
      secret_iv: encryptedSecret.iv,
      secret_auth_tag: encryptedSecret.authTag,
      secret_version: encryptedSecret.version,
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period_seconds: TOTP_PERIOD_SECONDS,
    })
  }

  return {
    success: true as const,
    secret,
    otpauthUrl,
    issuer: TOTP_ISSUER,
    accountName,
  }
}

export async function confirmTotpEnrollment(params: {
  userId: string
  code: string
}) {
  const now = new Date()

  return db.transaction(async (tx) => {
    const [method] = await tx
      .select()
      .from(UserMfaMethodsTable)
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, params.userId),
          eq(UserMfaMethodsTable.method, "totp"),
          isNull(UserMfaMethodsTable.disabled_at)
        )
      )
      .limit(1)

    if (!method || method.enabled_at) {
      return {
        success: false as const,
        failure: "Start authenticator app setup before verifying a code.",
      }
    }

    const secret = decryptTotpSecret({
      userId: params.userId,
      ciphertext: method.secret_ciphertext,
      iv: method.secret_iv,
      authTag: method.secret_auth_tag,
    })

    const matchedCounter = findValidTotpCounter({
      code: params.code,
      secret,
      lastUsedCounter: method.last_used_counter,
      digits: method.digits,
      algorithm: method.algorithm,
      periodSeconds: method.period_seconds,
    })

    if (matchedCounter === null) {
      return {
        success: false as const,
        failure: "The code you entered is incorrect or already used.",
      }
    }

    await tx
      .update(UserMfaMethodsTable)
      .set({
        is_primary: false,
        enabled_at: null,
        disabled_at: now,
        updated_at: now,
      })
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, params.userId),
          ne(UserMfaMethodsTable.id, method.id),
          isNull(UserMfaMethodsTable.disabled_at)
        )
      )

    await tx
      .update(UserMfaMethodsTable)
      .set({
        is_primary: true,
        enabled_at: now,
        verified_at: now,
        last_used_at: now,
        last_used_counter: matchedCounter,
        disabled_at: null,
        updated_at: now,
      })
      .where(eq(UserMfaMethodsTable.id, method.id))

    await tx.insert(VerificationsTable).values({
      user_id: params.userId,
      purpose: "mfa_enrollment",
      method: "totp",
      expires_at: now,
      consumed_at: now,
      metadata: { enrolled: true },
    })

    const recoveryCodes = await generateRecoveryCodesInTransaction(
      tx,
      params.userId
    )

    return {
      success: true as const,
      recoveryCodes,
    }
  })
}

export async function disableTotpMfaMethod(userId: string) {
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(UserMfaMethodsTable)
      .set({
        is_primary: false,
        disabled_at: now,
        updated_at: now,
      })
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, userId),
          eq(UserMfaMethodsTable.method, "totp"),
          isNull(UserMfaMethodsTable.disabled_at)
        )
      )

    await tx
      .delete(UserRecoveryCodesTable)
      .where(eq(UserRecoveryCodesTable.user_id, userId))

    await promoteLatestActiveMethod(tx, userId)
  })
}

async function generateRecoveryCodesInTransaction(
  tx: DbTransaction,
  userId: string
) {
  const batchId = randomUUID()
  const plainCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    generateRecoveryCode()
  )
  const hashedCodes = await Promise.all(
    plainCodes.map((code) => hashSecret(normalizeRecoveryCode(code)))
  )

  await tx
    .delete(UserRecoveryCodesTable)
    .where(eq(UserRecoveryCodesTable.user_id, userId))

  await tx.insert(UserRecoveryCodesTable).values(
    hashedCodes.map((codeHash) => ({
      user_id: userId,
      batch_id: batchId,
      code_hash: codeHash,
    }))
  )

  return plainCodes
}

export async function generateRecoveryCodes(userId: string) {
  return db.transaction((tx) => generateRecoveryCodesInTransaction(tx, userId))
}

export async function getRecoveryCodeSummary(userId: string) {
  const codes = await db
    .select({
      id: UserRecoveryCodesTable.id,
      used_at: UserRecoveryCodesTable.used_at,
    })
    .from(UserRecoveryCodesTable)
    .where(eq(UserRecoveryCodesTable.user_id, userId))

  return {
    enabled: codes.length > 0,
    remaining: codes.filter((code) => !code.used_at).length,
    total: codes.length,
  }
}

export async function consumeRecoveryCodeMfaChallenge(params: {
  verificationId: string
  userId: string
  code: string
}) {
  const now = new Date()
  const normalizedCode = normalizeRecoveryCode(params.code)

  return db.transaction(async (tx) => {
    const [challenge] = await tx
      .select()
      .from(VerificationsTable)
      .where(
        and(
          eq(VerificationsTable.id, params.verificationId),
          eq(VerificationsTable.user_id, params.userId),
          eq(VerificationsTable.purpose, "mfa_challenge"),
          eq(VerificationsTable.method, "totp"),
          isNull(VerificationsTable.consumed_at),
          gt(VerificationsTable.expires_at, now)
        )
      )
      .limit(1)

    if (!challenge) {
      return {
        success: false as const,
        failure: "Your recovery code verification has expired.",
      }
    }

    const recoveryCodes = await tx
      .select({
        id: UserRecoveryCodesTable.id,
        code_hash: UserRecoveryCodesTable.code_hash,
      })
      .from(UserRecoveryCodesTable)
      .where(
        and(
          eq(UserRecoveryCodesTable.user_id, params.userId),
          isNull(UserRecoveryCodesTable.used_at)
        )
      )

    let matchingCodeId: string | null = null

    for (const recoveryCode of recoveryCodes) {
      const valid = await verifySecret(recoveryCode.code_hash, normalizedCode)

      if (valid) {
        matchingCodeId = recoveryCode.id
        break
      }
    }

    if (!matchingCodeId) {
      const nextAttempts = challenge.attempts + 1

      await tx
        .update(VerificationsTable)
        .set({
          attempts: nextAttempts,
          consumed_at: nextAttempts >= TOTP_MFA_MAX_ATTEMPTS ? now : null,
        })
        .where(eq(VerificationsTable.id, challenge.id))

      return {
        success: false as const,
        failure:
          nextAttempts >= TOTP_MFA_MAX_ATTEMPTS
            ? "Too many incorrect attempts. Sign in again."
            : "That recovery code is incorrect or already used.",
      }
    }

    const consumedCodes = await tx
      .update(UserRecoveryCodesTable)
      .set({ used_at: now })
      .where(
        and(
          eq(UserRecoveryCodesTable.id, matchingCodeId),
          isNull(UserRecoveryCodesTable.used_at)
        )
      )
      .returning({ id: UserRecoveryCodesTable.id })

    if (consumedCodes.length === 0) {
      return {
        success: false as const,
        failure: "That recovery code has already been used.",
      }
    }

    await tx
      .update(UserMfaMethodsTable)
      .set({ last_used_at: now, updated_at: now })
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, params.userId),
          eq(UserMfaMethodsTable.method, "totp"),
          isNull(UserMfaMethodsTable.disabled_at)
        )
      )

    await tx
      .update(VerificationsTable)
      .set({
        consumed_at: now,
        metadata: {
          ...(challenge.metadata ?? {}),
          completedWith: "recovery_code",
        },
      })
      .where(eq(VerificationsTable.id, challenge.id))

    return {
      success: true as const,
      metadata: (challenge.metadata ?? {}) as MfaChallengeMetadata,
    }
  })
}

export async function issueEmailMfaChallenge(
  params: IssueEmailMfaChallengeParams
) {
  const now = new Date()
  const [existingChallenge] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.user_id, params.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, "email"),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, now)
      )
    )
    .orderBy(desc(VerificationsTable.created_at))
    .limit(1)

  const metadata = buildTotpChallengeMetadata(params)
  const canResend =
    !existingChallenge ||
    now.getTime() - existingChallenge.last_sent_at.getTime() >=
      EMAIL_MFA_RESEND_INTERVAL_MS

  if (!canResend) {
    return {
      verificationId: existingChallenge.id,
      sent: false,
      resendAvailableAt: new Date(
        existingChallenge.last_sent_at.getTime() + EMAIL_MFA_RESEND_INTERVAL_MS
      ),
    }
  }

  const code = generateVerificationCode()
  const codeHash = hashVerificationCode(code)
  const expiresAt = new Date(now.getTime() + MFA_CHALLENGE_TTL_MS)

  let verificationId = existingChallenge?.id

  if (existingChallenge) {
    await db
      .update(VerificationsTable)
      .set({
        target: params.email,
        token_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
        last_sent_at: now,
        metadata,
      })
      .where(eq(VerificationsTable.id, existingChallenge.id))
  } else {
    const [verification] = await db
      .insert(VerificationsTable)
      .values({
        user_id: params.userId,
        purpose: "mfa_challenge",
        method: "email",
        target: params.email,
        token_hash: codeHash,
        expires_at: expiresAt,
        last_sent_at: now,
        metadata,
      })
      .returning({ id: VerificationsTable.id })

    verificationId = verification.id
  }

  await sendEmailMfaCodeEmail({
    email: params.email,
    name: params.name,
    code,
  })

  return {
    verificationId: verificationId!,
    sent: true,
    resendAvailableAt: new Date(now.getTime() + EMAIL_MFA_RESEND_INTERVAL_MS),
  }
}

export async function issueTotpMfaChallenge(
  params: IssueTotpMfaChallengeParams
) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + MFA_CHALLENGE_TTL_MS)
  const metadata = buildTotpChallengeMetadata(params)

  const [existingChallenge] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.user_id, params.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, "totp"),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, now)
      )
    )
    .orderBy(desc(VerificationsTable.created_at))
    .limit(1)

  if (existingChallenge) {
    await db
      .update(VerificationsTable)
      .set({
        expires_at: expiresAt,
        attempts: 0,
        last_sent_at: now,
        metadata,
      })
      .where(eq(VerificationsTable.id, existingChallenge.id))

    return { verificationId: existingChallenge.id }
  }

  const [verification] = await db
    .insert(VerificationsTable)
    .values({
      user_id: params.userId,
      purpose: "mfa_challenge",
      method: "totp",
      expires_at: expiresAt,
      last_sent_at: now,
      metadata,
    })
    .returning({ id: VerificationsTable.id })

  return { verificationId: verification.id }
}

export async function verifyEmailMfaChallenge(params: {
  verificationId: string
  userId: string
  code: string
}) {
  const now = new Date()
  const [challenge] = await db
    .select()
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.id, params.verificationId),
        eq(VerificationsTable.user_id, params.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, "email"),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, now)
      )
    )
    .limit(1)

  if (!challenge || !challenge.token_hash) {
    return {
      success: false as const,
      failure: "This verification code has expired.",
    }
  }

  const nextAttempts = challenge.attempts + 1
  const codeValid = hashVerificationCode(params.code) === challenge.token_hash

  if (!codeValid) {
    await db
      .update(VerificationsTable)
      .set({
        attempts: nextAttempts,
        consumed_at: nextAttempts >= EMAIL_MFA_MAX_ATTEMPTS ? now : null,
      })
      .where(eq(VerificationsTable.id, challenge.id))

    return {
      success: false as const,
      failure:
        nextAttempts >= EMAIL_MFA_MAX_ATTEMPTS
          ? "Too many incorrect attempts. Request a new code."
          : "The code you entered is incorrect.",
    }
  }

  await db
    .update(VerificationsTable)
    .set({ consumed_at: now })
    .where(eq(VerificationsTable.id, challenge.id))

  await db
    .update(UserMfaMethodsTable)
    .set({ last_used_at: now, updated_at: now })
    .where(
      and(
        eq(UserMfaMethodsTable.user_id, params.userId),
        eq(UserMfaMethodsTable.method, "email"),
        isNull(UserMfaMethodsTable.disabled_at)
      )
    )

  return {
    success: true as const,
    metadata: (challenge.metadata ?? {}) as MfaChallengeMetadata,
  }
}

export async function verifyTotpMfaChallenge(params: {
  verificationId: string
  userId: string
  code: string
}) {
  const now = new Date()

  return db.transaction(async (tx) => {
    const [challenge] = await tx
      .select()
      .from(VerificationsTable)
      .where(
        and(
          eq(VerificationsTable.id, params.verificationId),
          eq(VerificationsTable.user_id, params.userId),
          eq(VerificationsTable.purpose, "mfa_challenge"),
          eq(VerificationsTable.method, "totp"),
          isNull(VerificationsTable.consumed_at),
          gt(VerificationsTable.expires_at, now)
        )
      )
      .limit(1)

    if (!challenge) {
      return {
        success: false as const,
        failure: "Your authenticator app verification has expired.",
      }
    }

    const [method] = await tx
      .select()
      .from(UserMfaMethodsTable)
      .where(
        and(
          eq(UserMfaMethodsTable.user_id, params.userId),
          eq(UserMfaMethodsTable.method, "totp"),
          isNotNull(UserMfaMethodsTable.enabled_at),
          isNull(UserMfaMethodsTable.disabled_at)
        )
      )
      .limit(1)

    if (!method) {
      return {
        success: false as const,
        failure: "Authenticator app MFA is not enabled for this account.",
      }
    }

    const secret = decryptTotpSecret({
      userId: params.userId,
      ciphertext: method.secret_ciphertext,
      iv: method.secret_iv,
      authTag: method.secret_auth_tag,
    })
    const nextAttempts = challenge.attempts + 1
    const matchedCounter = findValidTotpCounter({
      code: params.code,
      secret,
      lastUsedCounter: method.last_used_counter,
      digits: method.digits,
      algorithm: method.algorithm,
      periodSeconds: method.period_seconds,
    })

    if (matchedCounter === null) {
      await tx
        .update(VerificationsTable)
        .set({
          attempts: nextAttempts,
          consumed_at: nextAttempts >= TOTP_MFA_MAX_ATTEMPTS ? now : null,
        })
        .where(eq(VerificationsTable.id, challenge.id))

      return {
        success: false as const,
        failure:
          nextAttempts >= TOTP_MFA_MAX_ATTEMPTS
            ? "Too many incorrect attempts. Sign in again."
            : "The code you entered is incorrect or already used.",
      }
    }

    const updatedMethods = await tx
      .update(UserMfaMethodsTable)
      .set({
        last_used_at: now,
        last_used_counter: matchedCounter,
        updated_at: now,
      })
      .where(
        and(
          eq(UserMfaMethodsTable.id, method.id),
          or(
            isNull(UserMfaMethodsTable.last_used_counter),
            lt(UserMfaMethodsTable.last_used_counter, matchedCounter)
          )
        )
      )
      .returning({ id: UserMfaMethodsTable.id })

    if (updatedMethods.length === 0) {
      return {
        success: false as const,
        failure: "This authenticator code was already used. Wait for a new one.",
      }
    }

    await tx
      .update(VerificationsTable)
      .set({ consumed_at: now })
      .where(eq(VerificationsTable.id, challenge.id))

    return {
      success: true as const,
      metadata: (challenge.metadata ?? {}) as MfaChallengeMetadata,
    }
  })
}

export async function setPendingMfaCookie(state: PendingMfaState) {
  const cookieStore = await cookies()

  cookieStore.set(MFA_PENDING_COOKIE_NAME, encodePendingMfaState(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(MFA_CHALLENGE_TTL_MS / 1000),
  })
}

export async function getPendingMfaCookie() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(MFA_PENDING_COOKIE_NAME)

  if (!cookie?.value) {
    return null
  }

  return decodePendingMfaState(cookie.value)
}

export async function clearPendingMfaCookie() {
  const cookieStore = await cookies()

  cookieStore.set(MFA_PENDING_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
}

export async function getPendingMfaChallenge() {
  const pendingState = await getPendingMfaCookie()

  if (!pendingState) {
    return null
  }

  const [user] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      name: UsersTable.name,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, pendingState.userId))
    .limit(1)

  if (!user) {
    return null
  }

  const [challenge] = await db
    .select({
      id: VerificationsTable.id,
      expires_at: VerificationsTable.expires_at,
      last_sent_at: VerificationsTable.last_sent_at,
    })
    .from(VerificationsTable)
    .where(
      and(
        eq(VerificationsTable.id, pendingState.verificationId),
        eq(VerificationsTable.user_id, pendingState.userId),
        eq(VerificationsTable.purpose, "mfa_challenge"),
        eq(VerificationsTable.method, pendingState.method),
        isNull(VerificationsTable.consumed_at),
        gt(VerificationsTable.expires_at, new Date())
      )
    )
    .limit(1)

  if (!challenge) {
    return null
  }

  return {
    ...pendingState,
    email: user.email,
    name: user.name,
    maskedEmail:
      pendingState.method === "email" ? getEmailMfaMask(user.email) : undefined,
    expiresAt: challenge.expires_at,
    resendAvailableAt:
      pendingState.method === "email"
        ? new Date(
            challenge.last_sent_at.getTime() + EMAIL_MFA_RESEND_INTERVAL_MS
          )
        : challenge.expires_at,
  }
}
