/**
 * @file density-provider.tsx
 * @description Injects the active density mode as a CSS class into the application shell.
 */
'use client';

import React, { useEffect } from 'react';
import { useDesignStore } from '../store/design.store';

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const density = useDesignStore((state) => state.density);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('density-compact', 'density-standard', 'density-executive');
    body.classList.add(`density-${density}`);
  }, [density]);

  return <>{children}</>;
}
