import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  index,
  integer,
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

export const projectEvidenceKindEnum = pgEnum("project_evidence_kind", [
  "repository",
  "demo",
  "documentation",
  "write_up",
  "case_study",
  "other",
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
    context: text("context").default("").notNull(),
    outcome: text("outcome").default("").notNull(),
    tools: text("tools").default("").notNull(),
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

export const projectEvidenceLinksTable = pgTable(
  "project_evidence_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    project_id: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    kind: projectEvidenceKindEnum("kind").default("other").notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (evidenceLinks) => [
    index("project_evidence_links_project_id_idx").on(evidenceLinks.project_id),
    index("project_evidence_links_sort_order_idx").on(
      evidenceLinks.project_id,
      evidenceLinks.sort_order
    ),
  ]
)

export const ProjectEvidenceLinksTable = projectEvidenceLinksTable

export type Project = InferSelectModel<typeof projectsTable>
export type NewProject = InferInsertModel<typeof projectsTable>
export type ProjectEvidenceLink = InferSelectModel<typeof projectEvidenceLinksTable>
export type NewProjectEvidenceLink = InferInsertModel<typeof projectEvidenceLinksTable>
