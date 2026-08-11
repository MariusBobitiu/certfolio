CREATE TABLE "auth_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"key_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"blocked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "auth_rate_limits_scope_key_hash_unique_idx" ON "auth_rate_limits" USING btree ("scope","key_hash");--> statement-breakpoint
CREATE INDEX "auth_rate_limits_scope_idx" ON "auth_rate_limits" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "auth_rate_limits_blocked_until_idx" ON "auth_rate_limits" USING btree ("blocked_until");