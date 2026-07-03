import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { usersTable } from "../auth/schema"

export const userLinksTable = pgTable(
  "user_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    platform: text("platform").notNull().default("website"),
    label: text("label").notNull(),
    url: text("url").notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
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
  (links) => [
    index("user_links_user_id_idx").on(links.user_id),
    index("user_links_sort_order_idx").on(links.user_id, links.sort_order),
  ]
)

export const UserLinksTable = userLinksTable

export type UserLink = InferSelectModel<typeof userLinksTable>
export type NewUserLink = InferInsertModel<typeof userLinksTable>
