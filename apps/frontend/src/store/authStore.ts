import { create } from "zustand";
import { decodeJwt, type JwtPayload } from "@/lib/jwt";

const REFRESH_TOKEN_STORAGE_KEY = "excursion-trip:refreshToken";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
  finishInitializing: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    set({
      accessToken,
      refreshToken,
      user: decodeJwt(accessToken),
      isAuthenticated: true,
    });
  },
  clear: () => {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
  finishInitializing: () => set({ isInitializing: false }),
}));
