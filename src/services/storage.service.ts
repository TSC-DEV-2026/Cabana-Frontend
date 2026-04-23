import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cabana.access_token';
const TOKEN_TYPE_KEY = 'cabana.token_type';

export const storageService = {
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async getTokenType() {
    return SecureStore.getItemAsync(TOKEN_TYPE_KEY);
  },
  async saveToken(token: string, tokenType: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(TOKEN_TYPE_KEY, tokenType);
  },
  async clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_TYPE_KEY);
  },
};
