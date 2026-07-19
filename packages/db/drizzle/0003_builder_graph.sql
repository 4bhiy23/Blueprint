ALTER TABLE "questions" ADD COLUMN "position_x" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "position_y" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "builder_viewport" jsonb;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "first_question_id" uuid;--> statement-breakpoint
CREATE TABLE "question_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"source_question_id" uuid NOT NULL,
	"target_question_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_edges" ADD CONSTRAINT "question_edges_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_edges" ADD CONSTRAINT "question_edges_source_question_id_questions_id_fk" FOREIGN KEY ("source_question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_edges" ADD CONSTRAINT "question_edges_target_question_id_questions_id_fk" FOREIGN KEY ("target_question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_first_question_id_questions_id_fk" FOREIGN KEY ("first_question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "questions_form_id_idx" ON "questions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "question_edges_form_id_idx" ON "question_edges" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "question_edges_source_question_id_idx" ON "question_edges" USING btree ("source_question_id");--> statement-breakpoint
CREATE INDEX "question_edges_target_question_id_idx" ON "question_edges" USING btree ("target_question_id");
