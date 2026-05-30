import type { MetadataRoute } from 'next';

/** PWA / install manifest — improves mobile UX signals and add-to-home-screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Baalvion — The Global Trade Operating System',
    short_name: 'Baalvion',
    description:
      'The neutral institutional infrastructure for global trade: execution, finance, compliance, and logistics on one governed platform.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
