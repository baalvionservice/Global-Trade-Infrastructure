/**
 * @file tokens/index.ts
 * @description THE AUTHORITATIVE DESIGN TOKEN REGISTRY.
 * Governs the visual and cognitive operating state of the Sovereign OS.
 */

export const DESIGN_TOKENS = {
  colors: {
    navy: {
      950: '#020617', // Deep Space Background
      900: '#0F172A', // Command Surface
      800: '#1E293B', // Tactical Pane
      DEFAULT: '#0F172A',
    },
    primary: {
      DEFAULT: '#3B82F6', // Authority Blue
      high: '#6366F1',    // Indigo (Governance)
      glow: 'rgba(59, 130, 246, 0.5)',
    },
    semantic: {
      success: '#10B981', // Emerald (Verified Finality)
      warning: '#F59E0B', // Amber (Risk/Delay)
      critical: '#EF4444', // Red (Sanctions/Breach)
      security: '#818CF8', // Violet (Zero-Trust)
    }
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace', // Forensic data
    },
    scales: {
      compact: {
        h1: 'text-xl font-black uppercase tracking-tight',
        body: 'text-[12px] font-medium leading-tight',
        label: 'text-[8px] font-black uppercase tracking-[0.2em]',
      },
      standard: {
        h1: 'text-3xl font-black uppercase tracking-tight',
        body: 'text-sm font-medium leading-relaxed',
        label: 'text-[10px] font-black uppercase tracking-widest',
      }
    }
  },
  spacing: {
    compact: { p: 'p-4', gap: 'gap-3' },
    standard: { p: 'p-8', gap: 'gap-8' },
    executive: { p: 'p-12', gap: 'gap-12' }
  }
};