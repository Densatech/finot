import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import http from "./axios";
import { AUTH_EXPIRED_EVENT, tokens } from "./tokens";

function unauthorized(config: InternalAxiosRequestConfig) {
  return Promise.reject(
    new AxiosError("Unauthorized", "ERR", config, {}, { status: 401, statusText: "", headers: {}, config, data: {} }),
  );
}

describe("token refresh", () => {
  beforeEach(() => {
    localStorage.clear();
    tokens.set("expired-access", "refresh-1");
  });
  afterEach(() => vi.restoreAllMocks());

  it("refreshes once for parallel 401s and retries every request", async () => {
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({ data: { access: "fresh-access" } });
    // First attempt of each request fails with 401; the retry (with the new token) succeeds.
    http.defaults.adapter = (config) => {
      const auth = AxiosHeaders.from(config.headers).get("Authorization");
      if (auth === "JWT fresh-access") return Promise.resolve({ data: config.url, status: 200, statusText: "OK", headers: {}, config });
      return unauthorized(config);
    };

    const results = await Promise.all([http.get("/api/a/"), http.get("/api/b/"), http.get("/api/c/")]);

    expect(results.map((r) => r.data)).toEqual(["/api/a/", "/api/b/", "/api/c/"]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(tokens.getAccess()).toBe("fresh-access");
  });

  it("signs out and retries anonymously when the refresh token is rejected", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new Error("refresh rejected"));
    const expired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, expired);
    localStorage.setItem("i18nextLng", "am");

    http.defaults.adapter = (config) => {
      const auth = AxiosHeaders.from(config.headers).get("Authorization");
      if (!auth) return Promise.resolve({ data: "public", status: 200, statusText: "OK", headers: {}, config });
      return unauthorized(config);
    };

    const res = await http.get("/api/qa/questions/");
    expect(res.data).toBe("public");
    expect(tokens.hasSession()).toBe(false);
    expect(expired).toHaveBeenCalled();
    // Only our keys are removed; the saved language survives.
    expect(localStorage.getItem("i18nextLng")).toBe("am");
    window.removeEventListener(AUTH_EXPIRED_EVENT, expired);
  });
});
