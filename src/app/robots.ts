import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/platform', '/banks', '/governments', '/enterprises', '/logistics', '/pricing', '/about', '/contact'],
        disallow: [
          '/dashboard',
          '/buyer/',
          '/seller/',
          '/governance/',
          '/deals/',
          '/orders/',
          '/payments/',
          '/finance-settlement/',
          '/escrow/',
          '/financials/',
          '/compliance/',
          '/documents/',
          '/messages/',
          '/profile/',
          '/insurance/',
          '/intelligence-hub/',
          '/negotiations/',
          '/sourcing/',
          '/shipments/',
          '/carriers/',
          '/agents/',
          '/singularity-command/',
          '/infinity-command/',
          '/eternal-command/',
          '/godsystem-command/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
