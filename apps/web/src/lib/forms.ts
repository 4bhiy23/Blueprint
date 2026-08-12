export type FormStatus = "draft" | "published" | "closed" | "archived";
export const FORM_UPDATED_EVENT = "blueprint:form-updated";

export interface FormRecord {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  publicId: string;
  createdAt: string;
  responseCount?: number;
}

export interface FormOption {
  id: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  title: string;
  description: string | null;
  type: "text" | "number" | "email" | "select" | "radio" | "checkbox";
  required: boolean;
  options: FormOption[];
}

export interface FormDetails {
  form: FormRecord;
  questions: FormQuestion[];
}

export interface FormAnalytics {
  form: Pick<FormRecord, "id" | "title">;
  totalResponses: number;
  averageCompletionMs: number | null;
  responsesByDay: Array<{
    date: string;
    count: number;
  }>;
}

export interface FormResponseSummary {
  id: string;
  submittedAt: string;
  completionMs: number | null;
}

export interface FormResponses {
  form: Pick<FormRecord, "id" | "title">;
  responses: FormResponseSummary[];
}

export interface FormResponseDetails {
  form: Pick<FormRecord, "id" | "title">;
  response: FormResponseSummary & {
    answers: Array<{
      questionId: string;
      question: string;
      answer: string | null;
    }>;
  };
}
