const apiUrl = import.meta.env.VITE_API_URL;

// O Vite inlina esse valor em tempo de build: sem ele o axios sobe com
// baseURL undefined e as chamadas viram "undefined/auth/refresh" em producao.
if (!apiUrl) {
  throw new Error("VITE_API_URL nao esta definida.");
}

export const env = {
  apiUrl,
};
