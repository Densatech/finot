import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, getFieldErrors } from "./errors";

function axiosError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Request failed", "ERR", config, {}, { status, statusText: "", headers: {}, config, data });
}

describe("getErrorMessage", () => {
  it("prefers DRF detail", () => {
    expect(getErrorMessage(axiosError(403, { detail: "Service selection is currently closed." }))).toBe(
      "Service selection is currently closed.",
    );
  });

  it("reads the donation `error` key", () => {
    expect(getErrorMessage(axiosError(503, { error: "Payment gateway is currently unavailable." }))).toBe(
      "Payment gateway is currently unavailable.",
    );
  });

  it("flattens field errors with labels", () => {
    expect(getErrorMessage(axiosError(400, { email: ["A user with this email already exists."] }))).toBe(
      "Email: A user with this email already exists.",
    );
  });

  it("explains throttling and network failures", () => {
    expect(getErrorMessage(axiosError(429, { detail: "Request was throttled." }))).toMatch(/too many attempts/i);
    const network = new AxiosError("Network Error", "ERR_NETWORK", { headers: new AxiosHeaders() });
    expect(getErrorMessage(network)).toMatch(/cannot reach the server/i);
  });
});

describe("getFieldErrors", () => {
  it("maps DRF 400 bodies to one message per field", () => {
    expect(getFieldErrors(axiosError(400, { personal_phone: ["Enter a valid Ethiopian phone number."], batch_year: ["Too big.", "Bad."] }))).toEqual({
      personal_phone: "Enter a valid Ethiopian phone number.",
      batch_year: "Too big. Bad.",
    });
  });

  it("ignores non-400 errors", () => {
    expect(getFieldErrors(axiosError(500, { detail: "boom" }))).toEqual({});
  });
});
