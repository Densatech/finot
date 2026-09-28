import { isAxiosError } from "axios";

const FIELD_LABELS: Record<string, string> = {
  non_field_errors: "",
  email: "Email",
  password: "Password",
  new_password: "New password",
  re_new_password: "Password confirmation",
  token: "Reset link",
  uid: "Reset link",
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  personal_phone: "Phone",
  emergency_phone: "Emergency phone",
  batch_year: "Batch year",
  profile_image: "Profile image",
  amount: "Amount",
  fund_category: "Purpose",
  selections: "Selections",
};

function flatten(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) => {
      const label = key in FIELD_LABELS ? FIELD_LABELS[key] : key.replace(/_/g, " ");
      return flatten(v).map((msg) => (label ? `${label}: ${msg}` : msg));
    });
  }
  return [String(value)];
}

/** Field-level errors from a DRF 400 response, e.g. { email: "A user with this email already exists." } */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error) || error.response?.status !== 400) return {};
  const data = error.response.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const messages = flatten(value);
    if (messages.length) out[key] = messages.join(" ");
  }
  return out;
}

/** Turn any API/network error into a single human-readable sentence. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : "Cannot reach the server. Check your internet connection.";
    }
    const { status, data } = error.response;
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (data && typeof data === "object") {
      const body = data as Record<string, unknown>;
      if (typeof body.detail === "string") return body.detail;
      if (typeof body.error === "string") return body.error;
      const messages = flatten(body);
      if (messages.length) return messages.join(" ");
    }
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "Not found.";
    if (status >= 500) return "The server had a problem. Please try again shortly.";
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
