import { useEffect } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";

/**
 * Ao carregar a aplicação, se existir um refreshToken salvo (sobrevive a um F5),
 * tenta trocar por um accessToken novo antes de renderizar as rotas privadas.
 */
export function useInitAuth() {
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const { refreshToken, setTokens, clear, finishInitializing } =
        useAuthStore.getState();

      if (!refreshToken) {
        finishInitializing();
        return;
      }

      try {
        const tokens = await authApi.refresh(refreshToken);
        if (active) setTokens(tokens.accessToken, tokens.refreshToken);
      } catch {
        if (active) clear();
      } finally {
        if (active) finishInitializing();
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  return { isInitializing };
}
