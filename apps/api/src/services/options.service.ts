import { and, db, eq, gt, questionOptions, sql } from "@repo/db";
import type {
  CreateOptionInput,
  UpdateOptionInput,
} from "@repo/validators";

export const updateOptionForUser = async (
  optionId: string,
  updatedOption: UpdateOptionInput,
  originalOption: typeof questionOptions.$inferSelect,
) => {
  const changes: Record<string, unknown> = {};

  if (updatedOption.label !== originalOption.label) {
    changes.label = updatedOption.label;
  }

  if (updatedOption.orderIndex !== originalOption.orderIndex) {
    changes.orderIndex = updatedOption.orderIndex;
  }

  if (!Object.keys(changes).length) {
    return originalOption;
  }

  const [option] = await db
    .update(questionOptions)
    .set(changes)
    .where(eq(questionOptions.id, optionId))
    .returning();

  return option;
};

export const deleteOptionForUser = async (
  optionId: string,
  questionId: string,
  deletedOrderIndex: number,
) => {
  await db.transaction(async (tx) => {
    await tx.delete(questionOptions).where(eq(questionOptions.id, optionId));

    await tx
      .update(questionOptions)
      .set({
        orderIndex: sql`${questionOptions.orderIndex} - 1`,
      })
      .where(
        and(
          eq(questionOptions.questionId, questionId),
          gt(questionOptions.orderIndex, deletedOrderIndex),
        ),
      );
  });
};
