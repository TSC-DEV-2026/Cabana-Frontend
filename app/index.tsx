import { Redirect } from 'expo-router';

import { FullScreenLoader } from '@/src/components/FullScreenLoader';
import { useAuthStore } from '@/src/store/auth.store';
import type { AuthState } from '@/src/store/auth.store';
import React from 'react';

export default function IndexPage() {
  const isHydrated = useAuthStore((state: AuthState) => state.isHydrated);
  const token = useAuthStore((state: AuthState) => state.token);

  if (!isHydrated) {
    return <FullScreenLoader message="Carregando sessão..." />;
  }

  return <Redirect href={token ? '/(app)' : '/(auth)/login'} />;
}
