import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.trim() ||
  (extra.apiBaseUrl as string | undefined)?.trim() ||
  'http://127.0.0.1:8000';
