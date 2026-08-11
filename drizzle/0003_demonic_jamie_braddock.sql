ALTER TABLE "user_mfa_methods" ADD COLUMN "secret_auth_tag" text;--> statement-breakpoint
ALTER TABLE "user_mfa_methods" ADD COLUMN "last_used_counter" integer;