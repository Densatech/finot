import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type RegisterPayload } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { AUTH_EXPIRED_EVENT, tokens } from "@/lib/tokens";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  /** True only while restoring a stored session; public pages never wait on it. */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isPending, fetchStatus } = useQuery({
    queryKey: qk.me,
    queryFn: authApi.me,
    enabled: tokens.hasSession(),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const signOutLocally = useCallback(() => {
    tokens.clear();
    queryClient.setQueryData(qk.me, null);
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
  }, [queryClient]);

  // The HTTP layer fires this when a refresh token is rejected.
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, signOutLocally);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, signOutLocally);
  }, [signOutLocally]);

  const loadUser = useCallback(async () => {
    const me = await queryClient.fetchQuery({ queryKey: qk.me, queryFn: authApi.me, staleTime: 0 });
    return me;
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login(email, password);
      return loadUser();
    },
    [loadUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      await authApi.login(payload.email, payload.password);
      return loadUser();
    },
    [loadUser],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    signOutLocally();
  }, [signOutLocally]);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: qk.me });
  }, [queryClient]);

  // A disabled query is "pending" forever; only a running fetch means we're restoring a session.
  const loading = isPending && fetchStatus === "fetching";

  const value = useMemo<AuthContextValue>(
    () => ({ user: user ?? null, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
