import { api, ApiEnvelope } from '@/src/services/api';
import { PointPayload, QrCodeResponse, UserMe } from '@/src/types/auth';

export const usersService = {
  async me() {
    const response = await api.get<ApiEnvelope<UserMe>>('/api/v1/users/me');
    return response.data.data;
  },

  async logout() {
    const response = await api.post<ApiEnvelope<{ message?: string }>>('/api/v1/auth/logout');
    return response.data.data;
  },

  async registerPoint(payload: PointPayload) {
    const response = await api.post<ApiEnvelope<{ message?: string }>>('/api/v1/pontos/registro', payload);
    return response.data.data;
  },

  async getQrCode(userId: number) {
    const response = await api.get<ApiEnvelope<QrCodeResponse>>(`/api/v1/users/${userId}/qrcode`);
    return response.data.data;
  },
};
