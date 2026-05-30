/**
 * @file use-density.ts
 * @description Hook for components to consume and react to global UX density governance.
 */
'use client';

import { useDesignStore } from '../store/design.store';
import { DESIGN_TOKENS } from '../tokens';

export function useDensity() {
  const mode = useDesignStore((state) => state.density);
  
  // Resolve tokens safely based on mode
  const spacing = DESIGN_TOKENS.spacing[mode] || DESIGN_TOKENS.spacing.standard;
  const typography = (DESIGN_TOKENS.typography.scales as any)[mode === 'executive' ? 'executive' : mode === 'compact' ? 'compact' : 'operational'];

  return {
    mode,
    tokens: spacing,
    typography,
    isCompact: mode === 'compact',
    isStandard: mode === 'standard',
    isExecutive: mode === 'executive',
    densityClass: `density-${mode}`
  };
}
