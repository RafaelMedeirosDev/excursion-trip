import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";

const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"];

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(baseURL?: string): Promise<string> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();

  if (!refreshToken) {
    clear();
    throw new Error("No refresh token available");
  }

  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken,
    });
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    clear();
    throw error;
  }
}

export function setupInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;

      const isAuthEndpoint = AUTH_ENDPOINTS.some((url) =>
        originalRequest?.url?.includes(url),
      );

      if (
        error.response?.status === 401 &&
        !isAuthEndpoint &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          refreshPromise ??= refreshAccessToken(client.defaults.baseURL).finally(
            () => {
              refreshPromise = null;
            },
          );
          const newAccessToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
}
