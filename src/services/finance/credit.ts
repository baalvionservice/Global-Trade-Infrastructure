/**
 * @file finance/credit.ts
 * @description Credit SDK — Invoice Finance (factoring) + Trade BNPL.
 * Talks to credit-service (:3037) via the auth-gateway
 * (/finance-bff/invoice-finance/*, /finance-bff/bnpl/*).
 */
import { financeClient, unwrap, unwrapList, type Page } from './http';
import type {
  FinancedInvoice, SubmitInvoiceRequest,
  BnplPlan, CreateBnplPlanRequest, BnplInstallment,
} from './types';

const IF = '/invoice-finance';
const BNPL = '/bnpl';

export const credit = {
  // ── Invoice Finance ──
  async submitInvoice(input: SubmitInvoiceRequest): Promise<FinancedInvoice> {
    return unwrap(await financeClient.post<FinancedInvoice>(IF, input));
  },
  async getInvoice(id: string): Promise<FinancedInvoice> {
    return unwrap(await financeClient.get<FinancedInvoice>(`${IF}/${id}`));
  },
  async listInvoices(params: { status?: string; sellerId?: string; page?: number; size?: number } = {}): Promise<FinancedInvoice[]> {
    return unwrapList(await financeClient.get<Page<FinancedInvoice>>(IF, { page: 0, size: 20, ...params }));
  },
  async fundInvoice(id: string): Promise<FinancedInvoice> {
    return unwrap(await financeClient.post<FinancedInvoice>(`${IF}/${id}/fund`));
  },
  async collectInvoice(id: string, input: { amount: number; reference?: string }): Promise<FinancedInvoice> {
    return unwrap(await financeClient.post<FinancedInvoice>(`${IF}/${id}/collections`, input));
  },

  // ── Trade BNPL ──
  async createPlan(input: CreateBnplPlanRequest): Promise<BnplPlan> {
    return unwrap(await financeClient.post<BnplPlan>(`${BNPL}/plans`, input));
  },
  async getPlan(id: string): Promise<BnplPlan> {
    return unwrap(await financeClient.get<BnplPlan>(`${BNPL}/plans/${id}`));
  },
  async listPlans(params: { status?: string; buyerId?: string; page?: number; size?: number } = {}): Promise<BnplPlan[]> {
    return unwrapList(await financeClient.get<Page<BnplPlan>>(`${BNPL}/plans`, { page: 0, size: 20, ...params }));
  },
  async disbursePlan(id: string): Promise<BnplPlan> {
    return unwrap(await financeClient.post<BnplPlan>(`${BNPL}/plans/${id}/disburse`));
  },
  async repayPlan(id: string, input: { amount: number; reference?: string }): Promise<BnplPlan> {
    return unwrap(await financeClient.post<BnplPlan>(`${BNPL}/plans/${id}/repayments`, input));
  },
  async planInstallments(id: string): Promise<BnplInstallment[]> {
    return unwrapList(await financeClient.get<BnplInstallment[]>(`${BNPL}/plans/${id}/installments`));
  },
  async cancelPlan(id: string, reason?: string): Promise<BnplPlan> {
    return unwrap(await financeClient.post<BnplPlan>(`${BNPL}/plans/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`));
  },
  async writeOffPlan(id: string, reason?: string): Promise<BnplPlan> {
    return unwrap(await financeClient.post<BnplPlan>(`${BNPL}/plans/${id}/write-off`, reason ? { reason } : {}));
  },
};
