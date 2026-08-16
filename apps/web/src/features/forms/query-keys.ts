export const formQueryKeys = {
  all: ["forms"] as const,
  detail: (formId: string) => ["forms", formId] as const,
  builder: (formId: string) => ["forms", formId, "builder"] as const,
  analytics: (formId: string) => ["forms", formId, "analytics"] as const,
  responses: (formId: string) => ["forms", formId, "responses"] as const,
  response: (formId: string, responseId: string) =>
    ["forms", formId, "responses", responseId] as const,
  public: (publicId: string) => ["public-forms", publicId] as const,
};
