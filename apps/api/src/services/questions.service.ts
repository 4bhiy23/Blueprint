import {
  and,
  db,
  eq,
  forms,
  questionOptions,
  questions,
} from "@repo/db";
import type { CreateOptionInput } from "@repo/validators";

export const getOptionForUser = async (optionId: string) => {
  const [option] = await db
  .select()
  .from(questionOptions)
  .where(eq(questionOptions.id, optionId))

  return option
};

export const getQuestionForUser = async (questionId: string) => {
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId));

  return question;
};

export const getFormForUser = async (formId: string) => {
  const [form] = await db.select().from(forms).where(eq(forms.id, formId));

  return form;
};

export const checkOwnershipOfForm = async (
  userId: string,
  formOwnerId: string,
) => {
  return userId === formOwnerId;
};


export const addOptionToQuestionForUser = async (
  questionId: string,
  newOption: CreateOptionInput,
) => {
  const [option] = await db
    .insert(questionOptions)
    .values({
      questionId,
      label: newOption.label,
      orderIndex: newOption.orderIndex,
    })
    .returning();

  return option;
};
