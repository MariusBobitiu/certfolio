import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const authDeliveryMethodEnum = pgEnum("auth_delivery_method", [
  "email",
  "totp",
])

export const authVerificationPurposeEnum = pgEnum("auth_verification_purpose", [
  "email_verification",
  "password_reset",
  "sign_in_otp",
  "mfa_challenge",
  "mfa_enrollment",
  "mfa_disabled",
  "recovery_code_used",
  "recovery_codes_regenerated",
])

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    image: text("image").notNull(),
    password_hash: text("password_hash").notNull(),
    email_verified_at: timestamp("email_verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    slug: text("slug"),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    archived_at: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
    deleted_at: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (users) => [
    uniqueIndex("users_email_unique_idx").on(users.email),
    uniqueIndex("users_slug_unique_idx").on(users.slug),
    index("users_email_verified_at_idx").on(users.email_verified_at),
  ]
)

export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    session_token_hash: text("session_token_hash").notNull(),
    expires_at: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    last_seen_at: timestamp("last_seen_at", {
      withTimezone: true,
      mode: "date",
    }),
    revoked_at: timestamp("revoked_at", {
      withTimezone: true,
      mode: "date",
    }),
    ip_address: text("ip_address"),
    city: text("city"),
    user_agent: text("user_agent"),
  },
  (sessions) => [
    uniqueIndex("sessions_token_hash_unique_idx").on(
      sessions.session_token_hash
    ),
    index("sessions_user_id_idx").on(sessions.user_id),
    index("sessions_expires_at_idx").on(sessions.expires_at),
  ]
)

export const verificationsTable = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    purpose: authVerificationPurposeEnum("purpose").notNull(),
    method: authDeliveryMethodEnum("method").notNull(),
    target: text("target"),
    token_hash: text("token_hash"),
    expires_at: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    consumed_at: timestamp("consumed_at", {
      withTimezone: true,
      mode: "date",
    }),
    attempts: integer("attempts").default(0).notNull(),
    last_sent_at: timestamp("last_sent_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (verifications) => [
    index("verifications_user_id_idx").on(verifications.user_id),
    index("verifications_lookup_idx").on(
      verifications.user_id,
      verifications.purpose,
      verifications.method
    ),
    index("verifications_expires_at_idx").on(verifications.expires_at),
  ]
)

export const userMfaMethodsTable = pgTable(
  "user_mfa_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    method: authDeliveryMethodEnum("method").notNull(),
    label: text("label"),
    is_primary: boolean("is_primary").default(false).notNull(),
    secret_ciphertext: text("secret_ciphertext"),
    secret_iv: text("secret_iv"),
    secret_auth_tag: text("secret_auth_tag"),
    secret_version: integer("secret_version").default(1).notNull(),
    algorithm: text("algorithm").default("SHA1").notNull(),
    digits: integer("digits").default(6).notNull(),
    period_seconds: integer("period_seconds").default(30).notNull(),
    enabled_at: timestamp("enabled_at", {
      withTimezone: true,
      mode: "date",
    }),
    verified_at: timestamp("verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    last_used_at: timestamp("last_used_at", {
      withTimezone: true,
      mode: "date",
    }),
    last_used_counter: integer("last_used_counter"),
    disabled_at: timestamp("disabled_at", {
      withTimezone: true,
      mode: "date",
    }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (methods) => [
    index("user_mfa_methods_user_id_idx").on(methods.user_id),
    index("user_mfa_methods_method_idx").on(methods.method),
    index("user_mfa_methods_enabled_at_idx").on(methods.enabled_at),
  ]
)

export const userRecoveryCodesTable = pgTable(
  "user_recovery_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    batch_id: uuid("batch_id").notNull(),
    code_hash: text("code_hash").notNull(),
    used_at: timestamp("used_at", {
      withTimezone: true,
      mode: "date",
    }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (codes) => [
    index("user_recovery_codes_user_id_idx").on(codes.user_id),
    index("user_recovery_codes_batch_id_idx").on(codes.batch_id),
    index("user_recovery_codes_used_at_idx").on(codes.used_at),
  ]
)

export const authRateLimitsTable = pgTable(
  "auth_rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scope: text("scope").notNull(),
    key_hash: text("key_hash").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    window_started_at: timestamp("window_started_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    blocked_until: timestamp("blocked_until", {
      withTimezone: true,
      mode: "date",
    }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (limits) => [
    uniqueIndex("auth_rate_limits_scope_key_hash_unique_idx").on(
      limits.scope,
      limits.key_hash
    ),
    index("auth_rate_limits_scope_idx").on(limits.scope),
    index("auth_rate_limits_blocked_until_idx").on(limits.blocked_until),
  ]
)

export const trustedMfaDevicesTable = pgTable(
  "trusted_mfa_devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    selector: text("selector").notNull(),
    token_hash: text("token_hash").notNull(),
    expires_at: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    user_agent: text("user_agent"),
    last_used_at: timestamp("last_used_at", {
      withTimezone: true,
      mode: "date",
    }),
    revoked_at: timestamp("revoked_at", {
      withTimezone: true,
      mode: "date",
    }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (devices) => [
    uniqueIndex("trusted_mfa_devices_selector_unique_idx").on(devices.selector),
    index("trusted_mfa_devices_user_id_idx").on(devices.user_id),
    index("trusted_mfa_devices_expires_at_idx").on(devices.expires_at),
  ]
)

export const UsersTable = usersTable
export const SessionsTable = sessionsTable
export const VerificationsTable = verificationsTable
export const UserMfaMethodsTable = userMfaMethodsTable
export const UserRecoveryCodesTable = userRecoveryCodesTable
export const AuthRateLimitsTable = authRateLimitsTable
export const TrustedMfaDevicesTable = trustedMfaDevicesTable

export type User = InferSelectModel<typeof usersTable>
export type NewUser = InferInsertModel<typeof usersTable>
export type Session = InferSelectModel<typeof sessionsTable>
export type NewSession = InferInsertModel<typeof sessionsTable>
export type Verification = InferSelectModel<typeof verificationsTable>
export type NewVerification = InferInsertModel<
  typeof verificationsTable
>
export type UserMfaMethod = InferSelectModel<typeof userMfaMethodsTable>
export type NewUserMfaMethod = InferInsertModel<typeof userMfaMethodsTable>
export type UserRecoveryCode = InferSelectModel<typeof userRecoveryCodesTable>
export type NewUserRecoveryCode = InferInsertModel<typeof userRecoveryCodesTable>
export type AuthRateLimit = InferSelectModel<typeof authRateLimitsTable>
export type NewAuthRateLimit = InferInsertModel<typeof authRateLimitsTable>
export type TrustedMfaDevice = InferSelectModel<typeof trustedMfaDevicesTable>
export type NewTrustedMfaDevice = InferInsertModel<typeof trustedMfaDevicesTable>
