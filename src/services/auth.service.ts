import { api, ApiEnvelope } from '@/src/services/api';
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UserMe,
} from '@/src/types/auth';

export const authService = {
  async register(payload: RegisterPayload) {
    const response = await api.post<ApiEnvelope<UserMe>>('/api/v1/users', payload);
    return response.data.data;
  },

  async login(payload: LoginPayload) {
    const response = await api.post<ApiEnvelope<LoginResponse>>('/api/v1/auth/login', payload);
    return response.data.data;
  },

  async me() {
    const response = await api.get<ApiEnvelope<UserMe>>('/api/v1/users/me');
    return response.data.data;
  },
};
