/**
 * @file finance/trade-finance.ts
 * @description Trade-finance SDK — Letters of Credit (UCP 600) + Bank Guarantees (URDG 758).
 * Talks to trade-finance-service (:3036) via the auth-gateway
 * (/finance-bff/letters-of-credit/*, /finance-bff/bank-guarantees/*).
 */
import { financeClient, unwrap, unwrapList, type Page } from './http';
import type {
  LetterOfCredit, IssueLcRequest, LcPresentation, LcAmendment,
  BankGuarantee, IssueGuaranteeRequest, GuaranteeClaim,
} from './types';

const LC = '/letters-of-credit';
const BG = '/bank-guarantees';

export const tradeFinance = {
  // ── Letters of Credit ──
  async issueLC(input: IssueLcRequest): Promise<LetterOfCredit> {
    return unwrap(await financeClient.post<LetterOfCredit>(LC, input));
  },
  async getLC(id: string): Promise<LetterOfCredit> {
    return unwrap(await financeClient.get<LetterOfCredit>(`${LC}/${id}`));
  },
  async listLCs(params: { status?: string; beneficiaryId?: string; page?: number; size?: number } = {}): Promise<LetterOfCredit[]> {
    return unwrapList(await financeClient.get<Page<LetterOfCredit>>(LC, { page: 0, size: 20, ...params }));
  },
  async adviseLC(id: string): Promise<LetterOfCredit> {
    return unwrap(await financeClient.post<LetterOfCredit>(`${LC}/${id}/advise`));
  },
  async cancelLC(id: string, reason?: string): Promise<LetterOfCredit> {
    return unwrap(await financeClient.post<LetterOfCredit>(`${LC}/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`));
  },
  async amendLC(id: string, input: { newAmount?: number; newExpiryDate?: string; changes?: string; reason?: string }): Promise<LcAmendment> {
    return unwrap(await financeClient.post<LcAmendment>(`${LC}/${id}/amendments`, input));
  },
  async listAmendments(id: string): Promise<LcAmendment[]> {
    return unwrapList(await financeClient.get<LcAmendment[]>(`${LC}/${id}/amendments`));
  },
  async decideAmendment(id: string, amendmentId: string, accept: boolean): Promise<LcAmendment> {
    return unwrap(await financeClient.post<LcAmendment>(`${LC}/${id}/amendments/${amendmentId}/decision?accept=${accept}`));
  },
  async present(id: string, input: { presentedAmount: number; documents?: string[] }): Promise<LcPresentation> {
    return unwrap(await financeClient.post<LcPresentation>(`${LC}/${id}/presentations`, input));
  },
  async listPresentations(id: string): Promise<LcPresentation[]> {
    return unwrapList(await financeClient.get<LcPresentation[]>(`${LC}/${id}/presentations`));
  },
  async examinePresentation(id: string, presentationId: string, discrepancies: string[] = []): Promise<LcPresentation> {
    return unwrap(await financeClient.post<LcPresentation>(`${LC}/${id}/presentations/${presentationId}/examine`, { discrepancies }));
  },
  async waivePresentation(id: string, presentationId: string): Promise<LcPresentation> {
    return unwrap(await financeClient.post<LcPresentation>(`${LC}/${id}/presentations/${presentationId}/waive`));
  },
  async rejectPresentation(id: string, presentationId: string, reason?: string): Promise<LcPresentation> {
    return unwrap(await financeClient.post<LcPresentation>(`${LC}/${id}/presentations/${presentationId}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`));
  },
  async settlePresentation(id: string, presentationId: string): Promise<LcPresentation> {
    return unwrap(await financeClient.post<LcPresentation>(`${LC}/${id}/presentations/${presentationId}/settle`));
  },

  // ── Bank Guarantees ──
  async issueGuarantee(input: IssueGuaranteeRequest): Promise<BankGuarantee> {
    return unwrap(await financeClient.post<BankGuarantee>(BG, input));
  },
  async getGuarantee(id: string): Promise<BankGuarantee> {
    return unwrap(await financeClient.get<BankGuarantee>(`${BG}/${id}`));
  },
  async listGuarantees(params: { status?: string; beneficiaryId?: string; page?: number; size?: number } = {}): Promise<BankGuarantee[]> {
    return unwrapList(await financeClient.get<Page<BankGuarantee>>(BG, { page: 0, size: 20, ...params }));
  },
  async amendGuarantee(id: string, opts: { newAmount?: number; newExpiryDate?: string }): Promise<BankGuarantee> {
    const q = new URLSearchParams();
    if (opts.newAmount != null) q.set('newAmount', String(opts.newAmount));
    if (opts.newExpiryDate) q.set('newExpiryDate', opts.newExpiryDate);
    return unwrap(await financeClient.post<BankGuarantee>(`${BG}/${id}/amend?${q.toString()}`));
  },
  async cancelGuarantee(id: string, reason?: string): Promise<BankGuarantee> {
    return unwrap(await financeClient.post<BankGuarantee>(`${BG}/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`));
  },
  async releaseGuarantee(id: string): Promise<BankGuarantee> {
    return unwrap(await financeClient.post<BankGuarantee>(`${BG}/${id}/release`));
  },
  async makeClaim(id: string, input: { claimAmount: number; statement?: string; supportingDocuments?: string[] }): Promise<GuaranteeClaim> {
    return unwrap(await financeClient.post<GuaranteeClaim>(`${BG}/${id}/claims`, input));
  },
  async listClaims(id: string): Promise<GuaranteeClaim[]> {
    return unwrapList(await financeClient.get<GuaranteeClaim[]>(`${BG}/${id}/claims`));
  },
  async decideClaim(id: string, claimId: string, pay: boolean, reason?: string): Promise<GuaranteeClaim> {
    return unwrap(await financeClient.post<GuaranteeClaim>(`${BG}/${id}/claims/${claimId}/decision?pay=${pay}`, reason ? { reason } : {}));
  },
};
