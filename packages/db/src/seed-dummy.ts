import { db } from "./index.ts";
import { user } from "./schema/auth.ts";
import { forms } from "./schema/forms.ts";
import { questions } from "./schema/questions.ts";
import { questionOptions } from "./schema/questionOptions.ts";
import { questionEdges } from "./schema/questionEdges.ts";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding dummy form...");

  // 1. Get or create a dummy user
  let dbUser = await db.query.user.findFirst();
  if (!dbUser) {
    console.log("No user found. Creating a dummy user...");
    const result = await db.insert(user).values({
      id: "dummy_user_id",
      name: "Dummy User",
      email: "dummy@example.com",
      emailVerified: true,
    }).returning();
    dbUser = result[0];
  }
  console.log(`Using user ID: ${dbUser.id}`);

  // 2. Delete existing dummy form if it exists
  const publicId = "frm_dummy_feedback";
  const existingForm = await db.query.forms.findFirst({
    where: eq(forms.publicId, publicId),
  });

  if (existingForm) {
    console.log("Deleting existing dummy form...");
    await db.delete(forms).where(eq(forms.id, existingForm.id));
  }

  // 3. Create a new published form
  const formInsert = await db.insert(forms).values({
    ownerId: dbUser.id,
    title: "Customer Satisfaction Survey",
    description: "Please help us improve our service by answering a few quick questions.",
    status: "published",
    publicId,
  }).returning();
  const form = formInsert[0];
  console.log(`Created form: ${form.title} (${form.id})`);

  // 4. Create questions
  // Q1: Name
  const [q1] = await db.insert(questions).values({
    formId: form.id,
    title: "What is your name?",
    description: "Enter your full name",
    type: "text",
    required: true,
    orderIndex: 0,
  }).returning();

  // Q2: Email
  const [q2] = await db.insert(questions).values({
    formId: form.id,
    title: "What is your email address?",
    description: "We will only use this to send you updates",
    type: "email",
    required: true,
    orderIndex: 1,
  }).returning();

  // Q3: Rating
  const [q3] = await db.insert(questions).values({
    formId: form.id,
    title: "How likely are you to recommend us to a friend?",
    description: "Rate us from 1 to 10",
    type: "number",
    required: true,
    orderIndex: 2,
  }).returning();

  // Q4: Role
  const [q4] = await db.insert(questions).values({
    formId: form.id,
    title: "What is your primary role?",
    description: "Select the option that best describes you",
    type: "select",
    required: true,
    orderIndex: 3,
  }).returning();

  // Q4 options
  const q4Labels = ["Product Manager", "Software Engineer", "Designer", "Other"];
  const q4Opts = [];
  for (let i = 0; i < q4Labels.length; i++) {
    const [opt] = await db.insert(questionOptions).values({
      questionId: q4.id,
      label: q4Labels[i],
      orderIndex: i,
    }).returning();
    q4Opts.push(opt);
  }

  // Q5: Satisfaction
  const [q5] = await db.insert(questions).values({
    formId: form.id,
    title: "How satisfied are you with our form builder?",
    description: "Single choice option",
    type: "radio",
    required: true,
    orderIndex: 4,
  }).returning();

  // Q5 options
  const q5Labels = ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"];
  const q5Opts = [];
  for (let i = 0; i < q5Labels.length; i++) {
    const [opt] = await db.insert(questionOptions).values({
      questionId: q5.id,
      label: q5Labels[i],
      orderIndex: i,
    }).returning();
    q5Opts.push(opt);
  }

  // Q6: Features used
  const [q6] = await db.insert(questions).values({
    formId: form.id,
    title: "Which features have you used?",
    description: "Select all that apply",
    type: "checkbox",
    required: false,
    orderIndex: 5,
  }).returning();

  // Q6 options
  const q6Labels = ["Form Builder", "Response Analytics", "Sharing Links", "None of the above"];
  const q6Opts = [];
  for (let i = 0; i < q6Labels.length; i++) {
    const [opt] = await db.insert(questionOptions).values({
      questionId: q6.id,
      label: q6Labels[i],
      orderIndex: i,
    }).returning();
    q6Opts.push(opt);
  }

  // 5. Connect questions with edges
  const qList = [q1, q2, q3, q4, q5, q6];
  for (let i = 0; i < qList.length - 1; i++) {
    await db.insert(questionEdges).values({
      formId: form.id,
      sourceQuestionId: qList[i].id,
      targetQuestionId: qList[i + 1].id,
    });
  }

  // 6. Update form firstQuestionId
  await db.update(forms).set({
    firstQuestionId: q1.id,
  }).where(eq(forms.id, form.id));

  console.log(`Dummy form seeded successfully! Public ID: ${publicId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed dummy form:", err);
  process.exit(1);
});
