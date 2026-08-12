export type FormStatus = "draft" | "published" | "closed" | "archived";
export const FORM_UPDATED_EVENT = "blueprint:form-updated";

export interface FormRecord {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  publicId: string;
  createdAt: string;
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
