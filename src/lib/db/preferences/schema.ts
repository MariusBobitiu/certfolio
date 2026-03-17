import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { usersTable } from "../auth/schema"

export const userPreferencesTable = pgTable(
  "user_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accent_colour: text("accent_colour").default("blue").notNull(),
    bio: text("bio").default("").notNull(),
    public_profile: boolean("public_profile").default(true).notNull(),
    searchable: boolean("searchable").default(true).notNull(),
    show_email: boolean("show_email").default(false).notNull(),
    full_metadata: boolean("full_metadata").default(true).notNull(),
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
  (prefs) => [uniqueIndex("user_preferences_user_id_unique_idx").on(prefs.user_id)]
)

export const UserPreferencesTable = userPreferencesTable

export type UserPreferences = InferSelectModel<typeof userPreferencesTable>
export type NewUserPreferences = InferInsertModel<typeof userPreferencesTable>
