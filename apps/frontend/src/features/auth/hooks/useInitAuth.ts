import { useEffect } from "react";
import { env } from "@/config/env";
import { refreshSession } from "@/services/http/refreshSession";
import { useAuthStore } from "@/store/authStore";

/**
 * Ao carregar a aplicação, se existir um refreshToken salvo (sobrevive a um F5),
 * tenta trocar por um accessToken novo antes de renderizar as rotas privadas.
 *
 * Usa o `refreshSession` compartilhado, e não uma chamada própria: o
 * <StrictMode> monta esse efeito duas vezes em desenvolvimento, e como o
 * backend rotaciona o refresh token (revoga o antigo), a segunda execução
 * mandaria um token já revogado, tomaria 401 e derrubaria a sessão a cada F5.
 * A promessa compartilhada faz a segunda execução aguardar a primeira.
 */
export function useInitAuth() {
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    async function bootstrap() {
      const { refreshToken, finishInitializing } = useAuthStore.getState();

      if (!refreshToken) {
        finishInitializing();
        return;
      }

      try {
        await refreshSession(env.apiUrl);
      } catch {
        // quem decide deslogar é o refreshSession, e só no 401 — aqui basta
        // sair do estado de carregamento pra aplicação renderizar
      } finally {
        finishInitializing();
      }
    }

    bootstrap();
  }, []);

  return { isInitializing };
}
