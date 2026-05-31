/**
 * @file finance/index.ts
 * @description Barrel for the financial-services-java SDK. One import surface for the four
 * finance microservices wired through the auth-gateway BFF (/finance-bff/*):
 *   trade-finance (:3036) · credit (:3037) · fx (:3038) · wallet (:3039)
 *
 * Usage:
 *   import { fx, tradeFinance, credit, wallet } from '@/services/finance';
 *   const rates = await fx.rates('USD');
 *   const lc = await tradeFinance.issueLC({ ... });
 */
export { fx } from './fx';
export { tradeFinance } from './trade-finance';
export { credit } from './credit';
export { wallet } from './wallet';
export { FinanceError } from './http';
export * from './types';
