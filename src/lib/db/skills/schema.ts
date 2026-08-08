import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { usersTable } from "../auth/schema"

export const skillsTable = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").default("technical").notNull(),
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
  (skills) => [
    uniqueIndex("skills_user_name_unique_idx").on(skills.user_id, skills.name),
    index("skills_user_id_idx").on(skills.user_id),
    index("skills_sort_order_idx").on(skills.user_id, skills.sort_order),
  ]
)

export const SkillsTable = skillsTable

export type Skill = InferSelectModel<typeof skillsTable>
export type NewSkill = InferInsertModel<typeof skillsTable>
