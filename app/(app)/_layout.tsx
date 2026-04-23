import { Redirect, Slot } from 'expo-router';

import { FullScreenLoader } from '@/src/components/FullScreenLoader';
import { useAuthStore } from '@/src/store/auth.store';
import type { AuthState } from '@/src/store/auth.store';

export default function AppLayout() {
  const isHydrated = useAuthStore((state: AuthState) => state.isHydrated);
  const token = useAuthStore((state: AuthState) => state.token);

  if (!isHydrated) {
    return <FullScreenLoader message="Carregando sessão..." />;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
