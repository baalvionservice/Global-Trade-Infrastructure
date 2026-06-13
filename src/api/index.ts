/**
 * @file src/api/index.ts
 * @description Barrel for the Trade Operations (TradeOps Cloud) API layer. Every screen in the
 * `/trade-ops` control center imports its data hooks + DTOs from here. All calls route through the
 * auth-gateway BFF (tenant + auth + CSRF enforced server-side) — see ./client.ts.
 */
export * from './client';
export * from './keys';
export { TradeQueryProvider } from './query-provider';

export * from './shipments';
export * from './workflows';
export * from './readiness';
export * from './documents';
export * from './validation';
export * from './compliance';
export * from './hscodes';
export * from './logistics';
export * from './customs';
export * from './dispatch';
