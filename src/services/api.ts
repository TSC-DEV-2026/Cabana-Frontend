import axios from "axios";
import { useAuthStore } from "@/src/store/auth.store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 5000);

// ✅ ADICIONADO
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 interceptor de request
api.interceptors.request.use((config) => {
  const { token, tokenType } = useAuthStore.getState();

  if (token && tokenType) {
    config.headers.Authorization = `${tokenType} ${token}`;
  }

  return config;
});

// 🚨 interceptor de response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("[API] Backend não respondeu:", error.message);

      return Promise.reject({
        message: "Servidor indisponível. Verifique a conexão.",
        code: "NETWORK_ERROR",
      });
    }

    if (error.response.status === 401) {
      const { clearSession } = useAuthStore.getState();
      await clearSession();
    }

    if (error.response.status >= 500) {
      return Promise.reject({
        message: "Problema interno do servidor.",
        code: "SERVER_ERROR",
      });

      
    }

    return Promise.reject(error);
  }
);