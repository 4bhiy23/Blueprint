ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "opens_at" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "response_limit" integer;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "accept_multiple_responses" boolean DEFAULT true NOT NULL;
