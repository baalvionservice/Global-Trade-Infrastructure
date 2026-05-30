import type { NextConfig } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3025';

// Next.js dev (webpack HMR + react-refresh) runs on eval() and a localhost websocket; a CSP without
// 'unsafe-eval'/ws breaks the client bundle in dev (nothing hydrates). Relax in dev only; prod stays strict.
const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://placehold.co https://images.unsplash.com https://picsum.photos",
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src 'self' https://api.baalvion.com wss://api.baalvion.com https://*.googleapis.com${isDev ? ' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*' : ''}`,
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Same-origin proxy → canonical auth-gateway BFF (Phase 6E-8). The browser only ever talks to
  // this origin; the gateway owns the httpOnly session cookies (access/refresh) + the CSRF cookie,
  // verifies RS256, and forwards to trade-service with signed identity headers (x-identity-envelope).
  //   /trade-bff/auth/*  → gateway /auth/*            (login / register / refresh / logout / me)
  //   /trade-bff/*       → gateway /api/trade/v1/*    (data; session + CSRF + signed-identity proxy)
  // Order matters: the auth rule must precede the catch-all so /trade-bff/auth/login is not
  // misrouted into the data proxy.
  async rewrites() {
    const gateway = process.env.GATEWAY_PROXY_TARGET || 'http://localhost:3099';
    return [
      { source: '/trade-bff/auth/:path*', destination: `${gateway}/auth/:path*` },
      { source: '/trade-bff/:path*', destination: `${gateway}/api/trade/v1/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node:async_hooks': false,
        'node:events': false,
        'node:util': false,
        'node:crypto': false,
        'node:stream': false,
        'node:path': false,
        'node:fs': false,
        'kafkajs': false,
      };
    }
    config.module.rules.push({
      test: /node_modules\/.*\.js$/,
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

export default nextConfig;
