export type SupportPayload = {
  subject?: string;
  description?: string;
};

export function validateSupportPayload(payload: SupportPayload) {
  const subject = payload.subject?.trim() ?? "";
  const description = payload.description?.trim() ?? "";

  if (!subject || !description) {
    return { valid: false, error: "Subject and description required" };
  }
  if (subject.length > 200) {
    return { valid: false, error: "Subject too long" };
  }
  if (description.length > 2000) {
    return { valid: false, error: "Description too long" };
  }

  return { valid: true };
}
