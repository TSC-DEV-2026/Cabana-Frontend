import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL } from '@/src/constants/env';
import { useAuthStore } from '@/src/store/auth.store';

export interface ApiEnvelope<T> {
  data: T;
  error: {
    message?: string;
  } | null;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  const tokenType = useAuthStore.getState().tokenType || 'bearer';

  if (token) {
    config.headers.Authorization = `${capitalizeTokenType(tokenType)} ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().clearSession();
    }

    const apiMessage = error.response?.data?.error?.message;
    const fallbackMessage = error.message || 'Erro inesperado na comunicação com a API.';

    return Promise.reject(new Error(apiMessage || fallbackMessage));
  }
);

function capitalizeTokenType(value: string) {
  if (!value) return 'Bearer';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
