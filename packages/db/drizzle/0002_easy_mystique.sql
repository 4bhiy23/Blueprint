ALTER TABLE "forms" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "owner_id" SET DATA TYPE text;