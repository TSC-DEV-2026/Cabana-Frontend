import * as React from 'react';

import { useAuthStore } from '@/src/store/auth.store';
import type { AuthState } from '@/src/store/auth.store';

export function AuthBootstrap() {
  const hydrate = useAuthStore((state: AuthState) => state.hydrate);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
