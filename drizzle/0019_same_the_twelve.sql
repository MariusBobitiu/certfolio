WITH "ranked_mfa_methods" AS (
	SELECT
		"id",
		row_number() OVER (
			PARTITION BY "user_id", "method"
			ORDER BY
				("enabled_at" IS NOT NULL AND "disabled_at" IS NULL) DESC,
				("disabled_at" IS NULL) DESC,
				"updated_at" DESC,
				"created_at" DESC,
				"id" DESC
		) AS "method_rank"
	FROM "user_mfa_methods"
)
DELETE FROM "user_mfa_methods"
USING "ranked_mfa_methods"
WHERE "user_mfa_methods"."id" = "ranked_mfa_methods"."id"
	AND "ranked_mfa_methods"."method_rank" > 1;--> statement-breakpoint
CREATE UNIQUE INDEX "user_mfa_methods_user_id_method_unique_idx" ON "user_mfa_methods" USING btree ("user_id","method");
