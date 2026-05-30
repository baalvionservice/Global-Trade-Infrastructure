/**
 * @file financial.types.ts
 * @description Authoritative data contracts for Institutional Financial Operations, Liquidity, and Trade Finance.
 */

export type SettlementStatus = 'PENDING' | 'LOCKED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED' | 'FINALIZED' | 'SETTLED';

export type CurrencyCode = 'USD' | 'EUR' | 'SGD' | 'INR' | 'CNY' | 'GBP' | 'JPY' | 'AED';

export type InstrumentType = 'LETTER_OF_CREDIT' | 'INVOICE_FINANCE' | 'PO_FINANCE' | 'TRADE_CREDIT' | 'FACTORING';

export interface WalletNode {
  id: string;
  currency: CurrencyCode;
  balance: number;
  escrowLocked: number;
  availableLiquidity: number;
  jurisdiction: string;
  lastSync: string;
  trustScore: number;
}

export interface EscrowMandate {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: CurrencyCode;
  status: SettlementStatus;
  releaseCondition: 'MILESTONE_VERIFIED' | 'ARBITRATION_ORDER' | 'MANUAL_OVERRIDE';
  complianceSignature: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradeFinanceInstrument {
  id: string;
  type: InstrumentType;
  referenceId: string; // Order or Invoice ID
  amount: number;
  currency: CurrencyCode;
  status: 'DRAFT' | 'PENDING_BANK_APPROVAL' | 'ISSUED' | 'ADVISED' | 'ACCEPTED' | 'UTILIZED' | 'REPAID' | 'EXPIRED';
  issuingInstitutionId: string;
  beneficiaryId: string;
  expiryDate: string;
  interestRate?: number;
  collateralRefs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreditProfile {
  companyId: string;
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';
  score: number; // 0-1000
  totalLimit: number;
  utilizedAmount: number;
  availableCredit: number;
  delinquencyProb: number;
  lastReviewDate: string;
}

export interface TreasuryKPI {
  label: string;
  value: string | number;
  delta: string;
  status: 'optimal' | 'warning' | 'critical';
  category: 'LIQUIDITY' | 'EXPOSURE' | 'SETTLEMENT' | 'YIELD';
}

export interface FinancialLog {
  id: string;
  type?: string;
  category?: string;
  amount?: number;
  currency?: CurrencyCode | string;
  referenceId?: string;
  description?: string;
  actorId?: string;
  timestamp?: string;
  [key: string]: any;
}
