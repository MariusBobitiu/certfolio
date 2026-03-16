import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm"
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { usersTable } from "../auth/schema"

export const issuerKindEnum = pgEnum("issuer_kind", ["seeded", "custom"])

export const credentialSourceTypeEnum = pgEnum("credential_source_type", [
  "credly",
  "issuer_link",
  "uploaded_certificate",
  "manual",
])

export const credentialVerificationStatusEnum = pgEnum(
  "credential_verification_status",
  ["verified_external", "linked_external", "self_declared"]
)

export const credentialStatusEnum = pgEnum("credential_status", [
  "draft",
  "published",
  "archived",
])

export const issuersTable = pgTable(
  "issuers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    display_name: text("display_name").notNull(),
    normalized_name: text("normalized_name").notNull(),
    aliases: text("aliases").array().default(sql`ARRAY[]::text[]`).notNull(),
    kind: issuerKindEnum("kind").default("seeded").notNull(),
    website_url: text("website_url").default("").notNull(),
    logo_url: text("logo_url").default("").notNull(),
    theme_key: text("theme_key").default("").notNull(),
    created_by_user_id: uuid("created_by_user_id").references(() => usersTable.id, {
      onDelete: "cascade",
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
  (issuers) => [
    uniqueIndex("issuers_slug_unique_idx").on(issuers.slug),
    uniqueIndex("issuers_normalized_name_unique_idx").on(
      issuers.normalized_name
    ),
    index("issuers_display_name_idx").on(issuers.display_name),
    index("issuers_kind_idx").on(issuers.kind),
    index("issuers_created_by_user_id_idx").on(issuers.created_by_user_id),
  ]
)

export const IssuersTable = issuersTable

export const credentialsTable = pgTable(
  "credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    issuer_id: uuid("issuer_id")
      .notNull()
      .references(() => issuersTable.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    source_type: credentialSourceTypeEnum("source_type").notNull(),
    verification_status: credentialVerificationStatusEnum(
      "verification_status"
    )
      .notNull(),
    credential_code: text("credential_code").default("").notNull(),
    verification_url: text("verification_url").default("").notNull(),
    certificate_asset_key: text("certificate_asset_key").default("").notNull(),
    issued_on: timestamp("issued_on", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    expires_on: timestamp("expires_on", {
      withTimezone: true,
      mode: "date",
    }),
    summary: text("summary").default("").notNull(),
    status: credentialStatusEnum("status").default("draft").notNull(),
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
  (credentials) => [
    uniqueIndex("credentials_user_slug_unique_idx").on(
      credentials.user_id,
      credentials.slug
    ),
    index("credentials_user_id_idx").on(credentials.user_id),
    index("credentials_issuer_id_idx").on(credentials.issuer_id),
    index("credentials_status_idx").on(credentials.status),
    index("credentials_issued_on_idx").on(credentials.issued_on),
  ]
)

export const CredentialsTable = credentialsTable

export type Issuer = InferSelectModel<typeof issuersTable>
export type NewIssuer = InferInsertModel<typeof issuersTable>
export type Credential = InferSelectModel<typeof credentialsTable>
export type NewCredential = InferInsertModel<typeof credentialsTable>
