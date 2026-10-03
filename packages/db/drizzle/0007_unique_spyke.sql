ALTER TABLE "question_edges" ALTER COLUMN "target_question_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_edges" ADD COLUMN "condition" jsonb;--> statement-breakpoint
ALTER TABLE "question_edges" ADD COLUMN "order_index" integer DEFAULT 0 NOT NULL;
