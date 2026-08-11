ALTER TYPE "public"."auth_verification_purpose" ADD VALUE 'mfa_disabled';--> statement-breakpoint
ALTER TYPE "public"."auth_verification_purpose" ADD VALUE 'recovery_code_used';--> statement-breakpoint
ALTER TYPE "public"."auth_verification_purpose" ADD VALUE 'recovery_codes_regenerated';