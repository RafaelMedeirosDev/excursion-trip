import { httpClient } from "@/services/http/client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await httpClient.post<AuthTokens>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await httpClient.post<AuthTokens>("/auth/refresh", {
      refreshToken,
    });
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await httpClient.post("/auth/logout", { refreshToken });
  },
};
