CREATE TABLE "trusted_mfa_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"selector" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trusted_mfa_devices" ADD CONSTRAINT "trusted_mfa_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "trusted_mfa_devices_selector_unique_idx" ON "trusted_mfa_devices" USING btree ("selector");--> statement-breakpoint
CREATE INDEX "trusted_mfa_devices_user_id_idx" ON "trusted_mfa_devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trusted_mfa_devices_expires_at_idx" ON "trusted_mfa_devices" USING btree ("expires_at");