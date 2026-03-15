import { InferInsertModel, InferSelectModel } from "drizzle-orm"
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

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "published",
  "archived",
])

export const projectsTable = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    project_type: text("project_type").notNull(),
    role: text("role").notNull(),
    status: projectStatusEnum("status").default("draft").notNull(),
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
  (projects) => [
    uniqueIndex("projects_user_slug_unique_idx").on(projects.user_id, projects.slug),
    index("projects_user_id_idx").on(projects.user_id),
    index("projects_status_idx").on(projects.status),
    index("projects_created_at_idx").on(projects.created_at),
  ]
)

export const ProjectsTable = projectsTable

export type Project = InferSelectModel<typeof projectsTable>
export type NewProject = InferInsertModel<typeof projectsTable>
