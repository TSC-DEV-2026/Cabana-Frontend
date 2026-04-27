import { create } from 'zustand';

import { storageService } from '@/src/services/storage.service';
import { UserMe } from '@/src/types/auth';

export interface AuthState {
  token: string | null;
  tokenType: string | null;
  user: UserMe | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, tokenType: string) => Promise<void>;
  setUser: (user: UserMe | null) => void;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: (partial: Partial<AuthState>) => void) => ({
  token: null,
  tokenType: null,
  user: null,
  isHydrated: false,

  hydrate: async () => {
  try {
    const token = await storageService.getToken();
    const tokenType = await storageService.getTokenType();

    set({
      token,
      tokenType,
      isHydrated: true,
    });
  } catch (error) {
    console.error("[AuthStore] Erro ao hidratar:", error);

    set({
      token: null,
      tokenType: null,
      user: null,
      isHydrated: true, // 🔥 garante saída do loading
    });
  }
},

  setSession: async (token: string, tokenType: string) => {
    await storageService.saveToken(token, tokenType);
    set({ token, tokenType });
  },

  setUser: (user: UserMe | null) => {
    set({ user });
  },

  clearSession: async () => {
    await storageService.clearToken();
    set({ token: null, tokenType: null, user: null, isHydrated: true });
  },
}));
