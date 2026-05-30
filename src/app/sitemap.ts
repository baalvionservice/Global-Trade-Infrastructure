import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';

/**
 * Sitemap of the public, indexable marketing surface only. (Org/enterprise detail
 * pages are not publicly routable, so they're intentionally excluded — listing
 * 404-ing URLs here would hurt crawl trust.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/platform', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/banks', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/governments', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/enterprises', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/logistics', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/onboard', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/onboard/buyer', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/onboard/seller', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
  ];

  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
