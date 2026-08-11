CREATE TYPE "public"."project_evidence_kind" AS ENUM('repository', 'demo', 'documentation', 'write_up', 'case_study', 'other');--> statement-breakpoint
CREATE TABLE "project_evidence_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"kind" "project_evidence_kind" DEFAULT 'other' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_evidence_links" ADD CONSTRAINT "project_evidence_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_evidence_links_project_id_idx" ON "project_evidence_links" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_evidence_links_sort_order_idx" ON "project_evidence_links" USING btree ("project_id","sort_order");