import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { AUTH_EXPIRED_EVENT, tokens } from "./tokens";

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// In development the Vite proxy forwards /api and /auth, so an empty base URL is fine.
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

const REFRESH_PATH = "/auth/jwt/refresh/";

axiosInstance.interceptors.request.use((config) => {
  const token = tokens.getAccess();
  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("Authorization", `JWT ${token}`);
  }
  return config;
});

// One refresh at a time: parallel 401s all wait for the same promise.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refresh = tokens.getRefresh();
    refreshPromise = (
      refresh
        ? axios
            .post<{ access: string; refresh?: string }>(`${API_BASE_URL}${REFRESH_PATH}`, { refresh }, { timeout: 15000 })
            .then(({ data }) => {
              tokens.set(data.access, data.refresh);
              return data.access;
            })
        : Promise.reject(new Error("No refresh token"))
    ).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function isAuthEndpoint(url?: string) {
  return !!url && (url.includes("/auth/jwt/") || url.endsWith("/auth/users/"));
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url) &&
      (tokens.getRefresh() || tokens.getAccess())
    ) {
      original._retry = true;
      try {
        const access = await refreshAccessToken();
        original.headers = AxiosHeaders.from(original.headers);
        original.headers.set("Authorization", `JWT ${access}`);
        return axiosInstance(original);
      } catch {
        tokens.clear();
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        // A stale token also breaks public endpoints (DRF rejects invalid tokens even there),
        // so retry once anonymously; protected endpoints will still answer 401.
        original.headers = AxiosHeaders.from(original.headers);
        original.headers.delete("Authorization");
        return axiosInstance(original);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
