CREATE TYPE "public"."credential_source_type" AS ENUM('credly', 'issuer_link', 'uploaded_certificate', 'manual');--> statement-breakpoint
CREATE TYPE "public"."credential_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."credential_verification_status" AS ENUM('verified_external', 'linked_external', 'self_declared');--> statement-breakpoint
CREATE TYPE "public"."issuer_kind" AS ENUM('seeded', 'custom');--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"issuer_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"source_type" "credential_source_type" NOT NULL,
	"verification_status" "credential_verification_status" NOT NULL,
	"credential_code" text DEFAULT '' NOT NULL,
	"verification_url" text DEFAULT '' NOT NULL,
	"certificate_asset_key" text DEFAULT '' NOT NULL,
	"issued_on" timestamp with time zone NOT NULL,
	"expires_on" timestamp with time zone,
	"summary" text DEFAULT '' NOT NULL,
	"status" "credential_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issuers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"kind" "issuer_kind" DEFAULT 'seeded' NOT NULL,
	"website_url" text DEFAULT '' NOT NULL,
	"logo_url" text DEFAULT '' NOT NULL,
	"theme_key" text DEFAULT '' NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_issuer_id_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "public"."issuers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issuers" ADD CONSTRAINT "issuers_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "credentials_user_slug_unique_idx" ON "credentials" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "credentials_user_id_idx" ON "credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credentials_issuer_id_idx" ON "credentials" USING btree ("issuer_id");--> statement-breakpoint
CREATE INDEX "credentials_status_idx" ON "credentials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credentials_issued_on_idx" ON "credentials" USING btree ("issued_on");--> statement-breakpoint
CREATE UNIQUE INDEX "issuers_slug_unique_idx" ON "issuers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "issuers_name_idx" ON "issuers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "issuers_kind_idx" ON "issuers" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "issuers_created_by_user_id_idx" ON "issuers" USING btree ("created_by_user_id");