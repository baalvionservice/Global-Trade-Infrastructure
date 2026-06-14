import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';

/**
 * Crawl policy: expose the public marketing surface, keep the entire authenticated
 * trade application out of the index. (Auth pages also redirect bots to /login, so
 * their content is never crawlable — this is the explicit belt-and-suspenders.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/platform',
          '/banks',
          '/governments',
          '/enterprises',
          '/logistics',
          '/pricing',
          '/about',
          '/contact',
          '/onboard',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard',
          '/buyer/',
          '/seller/',
          '/agent/',
          '/governance/',
          '/oversight/',
          '/deals/',
          '/orders/',
          '/payments/',
          '/finance-settlement/',
          '/escrow/',
          '/financials/',
          '/compliance/',
          '/compliance-regulatory/',
          '/customs/',
          '/documents/',
          '/messages/',
          '/profile/',
          '/insurance/',
          '/intelligence-hub/',
          '/negotiations/',
          '/sourcing/',
          '/discovery/',
          '/shipments/',
          '/logistics-shipment/',
          '/carriers/',
          '/agents/',
          '/suppliers/',
          '/marketplace/',
          '/executive/',
          '/collaboration/',
          '/field/',
          '/settings/',
          '/trade-management/',
          '/trade-ops/',
          '/sanctions-screening/',
          '/crisis-center/',
          '/company/',
          '/organization/',
          '/platform/org/',
          '/access/',
          '/login',
          '/accept-invite',
          '/forgot-password',
          '/reset-password',
          '/mfa',
          '/api/',
          '/trade-bff/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
