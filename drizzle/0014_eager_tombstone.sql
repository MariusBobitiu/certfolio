ALTER TABLE "issuers" RENAME COLUMN "name" TO "display_name";--> statement-breakpoint
DROP INDEX "issuers_name_idx";--> statement-breakpoint
ALTER TABLE "issuers" ADD COLUMN "normalized_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "issuers" ADD COLUMN "aliases" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "issuers_normalized_name_unique_idx" ON "issuers" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "issuers_display_name_idx" ON "issuers" USING btree ("display_name");