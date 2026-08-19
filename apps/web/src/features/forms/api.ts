import { apiFetch, apiFetchBlob } from "@/lib/api";
import type {
  BuilderInput,
  FormAvailabilityStatus,
  QuestionType,
  SubmitResponseInput,
  UpdateFormInput,
} from "@repo/validators";
import type {
  FormAnalytics,
  FormDetails,
  FormRecord,
  FormResponseDetails,
  FormResponses,
} from "@/lib/forms";

export interface PublicForm {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
}

export interface PublicQuestionOption {
  id: string;
  label: string;
}

export interface PublicQuestion {
  id: string;
  title: string;
  description: string | null;
  type: QuestionType;
  required: boolean;
  options: PublicQuestionOption[];
  ratingMax: number;
  ratingLowLabel: string;
  ratingHighLabel: string;
}

export interface PublicFormResponse {
  alreadySubmitted: boolean;
  availabilityStatus: FormAvailabilityStatus;
  opensAt?: string | null;
  expiresAt?: string | null;
  form?: PublicForm;
  questions?: PublicQuestion[];
}

export type BuilderData = BuilderInput;

export const formsApi = {
  list: () => apiFetch<{ forms: FormRecord[] }>("/forms"),
  create: () => apiFetch<{ form: FormRecord }>("/forms", { method: "POST", body: JSON.stringify({}) }),
  get: (formId: string) => apiFetch<FormDetails>(`/forms/${formId}`),
  update: (formId: string, input: UpdateFormInput) =>
    apiFetch<{ form: FormRecord }>(`/forms/${formId}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (formId: string) => apiFetch<void>(`/forms/${formId}`, { method: "DELETE" }),
  duplicate: (formId: string) => apiFetch<{ form: FormRecord }>(`/forms/${formId}/duplicate`, { method: "POST" }),
  analytics: (formId: string) => apiFetch<FormAnalytics>(`/forms/${formId}/analytics`),
  responses: (formId: string) => apiFetch<FormResponses>(`/forms/${formId}/responses`),
  response: (formId: string, responseId: string) => apiFetch<FormResponseDetails>(`/forms/${formId}/responses/${responseId}`),
  downloadResponsesCsv: async (formId: string) => {
    const { blob, filename } = await apiFetchBlob(`/forms/${formId}/responses/export`);
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename ?? "form-responses.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  },
  builder: (formId: string) => apiFetch<BuilderData>(`/forms/${formId}/builder`),
  saveBuilder: (formId: string, builder: BuilderData) =>
    apiFetch<BuilderData>(`/forms/${formId}/builder`, { method: "PUT", body: JSON.stringify(builder) }),
  publicForm: (publicId: string) => apiFetch<PublicFormResponse>(`/public/forms/${publicId}`),
  submitPublicResponse: (publicId: string, payload: SubmitResponseInput) =>
    apiFetch(`/public/forms/${publicId}/responses`, { method: "POST", body: JSON.stringify(payload) }),
};
