import type { Role } from "@excursion-trip/shared";
import { useCallback } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, isAuthenticated, refreshToken, setTokens, clear } =
    useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login(email, password);
      setTokens(tokens.accessToken, tokens.refreshToken);
    },
    [setTokens],
  );

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // sessão já é limpa localmente mesmo se a chamada falhar
      }
    }
    clear();
  }, [refreshToken, clear]);

  const hasRole = useCallback(
    (role: Role) => user?.role === role,
    [user],
  );

  return { user, isAuthenticated, login, logout, hasRole };
}
