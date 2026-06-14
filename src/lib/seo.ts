/**
 * @file src/lib/seo.ts
 * @description Centralized SEO helpers for the public/marketing surface — a single,
 * consistent source for per-page <title>/description/canonical/Open-Graph/Twitter
 * metadata plus JSON-LD structured data. Keeps every public page rankable and
 * share-ready without duplicating boilerplate.
 */
import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';
export const SITE_NAME = 'Baalvion';
export const SITE_TAGLINE = 'The Global Trade Operating System';
/** Shared social share card (static PNG generated at app/opengraph-image.png). */
export const OG_IMAGE = `${SITE_URL}/opengraph-image.png`;

/** Absolute URL for a path (canonical/OG need absolute URLs to rank correctly). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Route path, e.g. "/pricing". Drives the canonical + OG url. */
  path: string;
  keywords?: string[];
  /** Set true on transactional/utility funnels we don't want competing in search. */
  noindex?: boolean;
  /** Optional OG type (default "website"; use "article" for editorial). */
  type?: 'website' | 'article';
}

/**
 * Build a complete, consistent Metadata object for a public page. Title is left
 * bare so the root layout's `template` ("%s | Baalvion OS") composes it.
 */
export function pageMetadata({ title, description, path, keywords, noindex, type = 'website' }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME} OS`,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@baalvion',
      title: `${title} | ${SITE_NAME} OS`,
      description,
      images: [OG_IMAGE],
    },
    ...(noindex
      ? { robots: { index: false, follow: true } }
      : { robots: { index: true, follow: true } }),
  };
}

/** Organization schema — establishes the brand entity for knowledge-panel / rich results. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: 'Baalvion',
    url: SITE_URL,
    logo: absoluteUrl('/icon.svg'),
    description:
      'Baalvion is the neutral institutional infrastructure layer for global trade — connecting execution, finance, compliance, and logistics in one governed platform.',
    sameAs: ['https://twitter.com/baalvion', 'https://www.linkedin.com/company/baalvion'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'contact@baalvion.com',
      availableLanguage: ['en'],
    },
  };
}

/** WebSite schema with a SearchAction — enables the sitelinks search box. */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: `${SITE_NAME} — ${SITE_TAGLINE}.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/platform?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** SoftwareApplication / Product schema for the home + platform pages. */
export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    offers: { '@type': 'Offer', price: '499', priceCurrency: 'USD' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '128' },
  };
}

interface ServiceJsonLdInput {
  /** Human-readable service name, e.g. "Trade Finance Solutions for Banks". */
  name: string;
  description: string;
  /** Route path the service is described on, e.g. "/banks". */
  path: string;
  /** Audience the service serves, e.g. "Banks". */
  audience?: string;
}

/**
 * Service schema for the solution/persona pages (/banks, /governments, /enterprises,
 * /logistics, /platform) — describes the offering to search engines as a provided
 * service tied to the Baalvion brand entity.
 */
export function serviceJsonLd({ name, description, path, audience }: ServiceJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: absoluteUrl(path),
    serviceType: name,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: 'Worldwide',
    ...(audience
      ? { audience: { '@type': 'Audience', audienceType: audience } }
      : {}),
  };
}

/** BreadcrumbList schema for a page's position in the site hierarchy. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Small server component to drop one or more JSON-LD blobs into a page. */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
