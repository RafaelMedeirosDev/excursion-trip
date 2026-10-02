import axios, { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * Único caminho de renovação de sessão do app — usado pelo interceptor (quando
 * uma requisição toma 401) e pelo bootstrap (`useInitAuth`).
 *
 * A promessa fica no módulo de propósito: o backend **rotaciona** o refresh
 * token (revoga o antigo ao emitir o novo), então duas chamadas simultâneas com
 * o mesmo token fariam a segunda falhar com 401 e derrubar a sessão. É
 * exatamente o que acontecia no boot, porque o <StrictMode> monta o efeito duas
 * vezes em desenvolvimento.
 */
let refreshPromise: Promise<string> | null = null;

const NETWORK_RETRY_DELAY_MS = 1500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sem `response` = a requisição nem chegou ao servidor (API reiniciando, rede caiu). */
function isNetworkError(error: unknown) {
  return isAxiosError(error) && !error.response;
}

async function postRefresh(baseURL: string | undefined, refreshToken: string) {
  const { data } = await axios.post(`${baseURL}/auth/refresh`, {
    refreshToken,
  });
  return data;
}

async function run(baseURL?: string): Promise<string> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();

  if (!refreshToken) {
    clear();
    throw new Error("No refresh token available");
  }

  try {
    let data;

    try {
      data = await postRefresh(baseURL, refreshToken);
    } catch (error) {
      // uma segunda tentativa só faz sentido quando o servidor não respondeu —
      // tipicamente a API reiniciando. Status de erro (401, 429, 5xx) não muda
      // em 1,5s: o 429 tem janela de um minuto, e esperar isso no boot seria
      // pior que a falha.
      if (!isNetworkError(error)) {
        throw error;
      }

      await wait(NETWORK_RETRY_DELAY_MS);
      data = await postRefresh(baseURL, refreshToken);
    }

    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    // só credencial inválida desloga. Falha de rede, 429 e 5xx são transitórios:
    // apagar a sessão neles custa um login a cada soluço do servidor.
    if (isAxiosError(error) && error.response?.status === 401) {
      clear();
    }
    throw error;
  }
}

export function refreshSession(baseURL?: string): Promise<string> {
  refreshPromise ??= run(baseURL).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
