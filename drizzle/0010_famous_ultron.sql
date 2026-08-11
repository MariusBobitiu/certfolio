ALTER TABLE "projects" ADD COLUMN "context" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "outcome" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tools" text DEFAULT '' NOT NULL;