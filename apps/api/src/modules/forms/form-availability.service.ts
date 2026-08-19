import { db, forms, inArray, responses, sql } from "@repo/db";
import type { FormAvailabilityStatus } from "@repo/validators";

export class FormUnavailableError extends Error {
  constructor(public readonly availabilityStatus: Exclude<FormAvailabilityStatus, "accepting">) {
    const messages: Record<Exclude<FormAvailabilityStatus, "accepting">, string> = {
      not_open_yet: "This form is not accepting responses yet.",
      expired: "This form has expired.",
      response_limit_reached: "This form has reached its response limit.",
      closed: "This form is closed.",
      draft: "This form has not been published yet.",
      archived: "This form has been archived and is unavailable.",
    };
    super(messages[availabilityStatus]);
    this.name = "FormUnavailableError";
  }
}

export class DuplicateResponseError extends Error {
  constructor() {
    super("You have already submitted a response to this form.");
    this.name = "DuplicateResponseError";
  }
}

export class FormSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormSettingsValidationError";
  }
}

export function getAvailabilityStatus(
  form: Pick<typeof forms.$inferSelect, "status" | "opensAt" | "expiresAt" | "responseLimit">,
  responseCount: number,
  now = new Date(),
): FormAvailabilityStatus {
  if (form.status === "closed") return "closed";
  if (form.status === "archived") return "archived";
  if (form.status === "draft") return "draft";
  if (form.opensAt && form.opensAt > now) return "not_open_yet";
  if (form.expiresAt && form.expiresAt <= now) return "expired";
  if (form.responseLimit !== null && responseCount >= form.responseLimit) {
    return "response_limit_reached";
  }
  return "accepting";
}

export async function getResponseCountsByFormId(formIds: string[]) {
  if (formIds.length === 0) return new Map<string, number>();

  const counts = await db
    .select({ formId: responses.formId, responseCount: sql<number>`count(*)` })
    .from(responses)
    .where(inArray(responses.formId, formIds))
    .groupBy(responses.formId);

  return new Map(counts.map((count) => [count.formId, Number(count.responseCount)]));
}
