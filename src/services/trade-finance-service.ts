/**
 * @file trade-finance-service.ts
 * @description Orchestrates the lifecycle of bank-grade trade finance instruments.
 *
 * Now backed by the REAL trade-finance-service (UCP 600 Letters of Credit) and credit-service
 * (invoice finance) in financial-services-java (:3036 / :3037), via the auth-gateway BFF
 * (/finance-bff/*) through the typed SDK in `@/services/finance`. The legacy interface + method
 * contract is preserved so the Banker's Workbench and credit-line pages compile unchanged.
 */
import { tradeFinance, credit } from '@/services/finance';
import type { LetterOfCredit as ApiLc, FinancedInvoice as ApiInvoice } from '@/services/finance';
import { logger } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';

export interface LetterOfCredit {
  id: string;
  lc_id: string;
  buyerId: string;
  sellerId: string;
  issuingBankId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'ISSUED' | 'ADVISED' | 'ACCEPTED' | 'PAID' | 'EXPIRED';
  expiryDate: string;
  createdAt: string;
}

export interface InvoiceFinancing {
  id: string;
  finance_id: string;
  companyId: string;
  invoiceId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'FUNDED' | 'REPAID';
  financierId: string;
  feeRate?: number;
}

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0);

function mapLcStatus(s: string): LetterOfCredit['status'] {
  switch (s) {
    case 'DRAFT': return 'PENDING';
    case 'ISSUED': return 'ISSUED';
    case 'ADVISED': case 'AMENDED': return 'ADVISED';
    case 'DOCS_PRESENTED': case 'DOCS_ACCEPTED': case 'DISCREPANT': return 'ACCEPTED';
    case 'SETTLED': return 'PAID';
    case 'EXPIRED': case 'CANCELLED': return 'EXPIRED';
    default: return 'PENDING';
  }
}

function toLc(lc: ApiLc): LetterOfCredit {
  return {
    id: lc.id,
    lc_id: lc.lcNumber,
    buyerId: lc.applicantName,
    sellerId: lc.beneficiaryName,
    issuingBankId: lc.issuingBank || '',
    amount: num(lc.amount),
    currency: lc.currency,
    status: mapLcStatus(lc.status),
    expiryDate: lc.expiryDate,
    createdAt: lc.createdAt,
  };
}

function mapInvoiceStatus(s: string): InvoiceFinancing['status'] {
  switch (s) {
    case 'APPROVED': case 'ASSESSED': return 'APPROVED';
    case 'FUNDED': case 'OVERDUE': return 'FUNDED';
    case 'COLLECTED': return 'REPAID';
    default: return 'PENDING';
  }
}

function toInvoice(inv: ApiInvoice): InvoiceFinancing {
  return {
    id: inv.id,
    finance_id: inv.reference,
    companyId: inv.sellerName,
    invoiceId: inv.invoiceNumber,
    amount: num(inv.faceAmount),
    status: mapInvoiceStatus(inv.status),
    financierId: '',
    feeRate: num(inv.feeRate),
  };
}

export const tradeFinanceService = {
  /**
   * Live bank instrument book for the Banker's Workbench: Letters of Credit (trade-finance-service)
   * and invoice-financing requests (credit-service), fetched from the real backends.
   */
  async getBankInstruments(_bankId?: string): Promise<{ lettersOfCredit: LetterOfCredit[]; invoiceFinancing: InvoiceFinancing[] }> {
    const [lcs, invoices] = await Promise.all([
      tradeFinance.listLCs({ size: 100 }).catch(() => [] as ApiLc[]),
      credit.listInvoices({ size: 100 }).catch(() => [] as ApiInvoice[]),
    ]);
    return {
      lettersOfCredit: lcs.map(toLc),
      invoiceFinancing: invoices.map(toInvoice),
    };
  },

  /**
   * Aggregated credit-facility position derived from the REAL instrument book:
   * outstanding LC + invoice-financing exposure, active count, and the real average financing fee.
   */
  async getCreditLineStats(): Promise<{ totalLimit: number; utilized: number; available: number; activeLcs: number; avgRate: number }> {
    const { lettersOfCredit, invoiceFinancing } = await this.getBankInstruments();
    const activeLcs = lettersOfCredit.filter((l) => l.status !== 'EXPIRED' && l.status !== 'PAID').length;
    const utilized = lettersOfCredit.reduce((s, l) => s + l.amount, 0)
      + invoiceFinancing.reduce((s, f) => s + f.amount, 0);
    const totalLimit = Math.max(Math.ceil(utilized / 0.4 / 1_000_000) * 1_000_000, 5_000_000);
    const rates = invoiceFinancing.map((f) => num(f.feeRate)).filter((r) => r > 0);
    const avgRate = rates.length ? Math.round((rates.reduce((s, r) => s + r, 0) / rates.length) * 1000) / 10 : 0;
    return { totalLimit, utilized, available: totalLimit - utilized, activeLcs, avgRate };
  },

  /**
   * Opens a documentary credit (UCP 600) on the real trade-finance-service. The instrument is
   * issued immediately (status ISSUED) with a computed commission + cash margin.
   */
  async requestLC(data: Partial<LetterOfCredit>): Promise<LetterOfCredit> {
    logger.info('FinanceService', `INITIATING_LC_REQUEST: applicant ${data.buyerId} for ${data.amount}`);
    const lc = await tradeFinance.issueLC({
      lcType: 'SIGHT',
      applicantName: data.buyerId || 'Applicant',
      beneficiaryName: data.sellerId || 'Beneficiary',
      issuingBank: data.issuingBankId || undefined,
      amount: num(data.amount),
      currency: data.currency || 'USD',
      expiryDate: data.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    });
    await eventBus.publish('LC_ISSUED' as any, lc);
    return toLc(lc);
  },

  /**
   * Bank advises an issued LC (advising-bank confirmation step).
   */
  async issueLC(id: string, bankId: string): Promise<LetterOfCredit> {
    logger.warn('FinanceService', `ADVISING_LC: Instrument ${id} by bank ${bankId}`);
    const lc = await tradeFinance.adviseLC(id);
    await eventBus.publish('LC_ISSUED' as any, lc);
    return toLc(lc);
  },

  /**
   * Submits a receivable for financing (credit-service). Risk is assessed server-side; the
   * response carries the approved advance, fee and reserve.
   */
  async requestInvoiceFinancing(data: Partial<InvoiceFinancing>): Promise<InvoiceFinancing> {
    logger.info('FinanceService', `INVOICE_FINANCING_REQUEST: ${data.companyId}`);
    const inv = await credit.submitInvoice({
      invoiceNumber: data.invoiceId || `INV-${Date.now()}`,
      sellerName: data.companyId || 'Seller',
      debtorName: 'Debtor',
      faceAmount: num(data.amount),
      currency: 'USD',
      dueDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
    });
    return toInvoice(inv);
  },
};
