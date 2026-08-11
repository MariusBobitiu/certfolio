CREATE TABLE "user_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "headline" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "featured_credential_ids" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "featured_project_ids" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_links" ADD CONSTRAINT "user_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_links_user_id_idx" ON "user_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_links_sort_order_idx" ON "user_links" USING btree ("user_id","sort_order");