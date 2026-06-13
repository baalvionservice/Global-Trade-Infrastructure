import { LogisticsClient } from "./logistics-client";

/**
 * @file src/app/(public)/logistics/page.tsx
 * @description Logistics solution page. SEO metadata + breadcrumb JSON-LD are
 * owned by ./layout.tsx; this server component renders the client experience.
 */
export default function LogisticsPage() {
  return <LogisticsClient />;
}
