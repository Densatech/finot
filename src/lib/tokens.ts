// Only these keys are ours; never call localStorage.clear() (it would wipe e.g. the language choice).
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const tokens = {
  getAccess: () => read(ACCESS_KEY),
  getRefresh: () => read(REFRESH_KEY),
  set(access: string, refresh?: string) {
    try {
      localStorage.setItem(ACCESS_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      /* storage unavailable (private mode): the session lasts for this page only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* ignore */
    }
  },
  hasSession: () => Boolean(read(ACCESS_KEY) || read(REFRESH_KEY)),
};

/** Fired when the session can no longer be refreshed; AuthProvider signs the user out. */
export const AUTH_EXPIRED_EVENT = "finot:auth-expired";
