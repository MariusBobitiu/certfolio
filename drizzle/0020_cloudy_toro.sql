ALTER TABLE "users" ADD COLUMN "image_key" text;--> statement-breakpoint
UPDATE "users"
SET "image_key" = substring("image" from '(profiles/[^?]+)')
WHERE "image_key" IS NULL
	AND "image" LIKE '%profiles/%';
