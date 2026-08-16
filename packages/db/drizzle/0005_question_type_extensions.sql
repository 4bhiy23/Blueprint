ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'paragraph';--> statement-breakpoint
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'date';--> statement-breakpoint
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'datetime';--> statement-breakpoint
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'time';--> statement-breakpoint
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'rating';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "rating_max" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "rating_low_label" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "rating_high_label" text;
