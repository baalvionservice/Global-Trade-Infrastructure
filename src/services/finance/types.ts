/**
 * @file finance/types.ts
 * @description TypeScript mirrors of the financial-services-java DTOs (Jackson camelCase JSON).
 * Money fields arrive as decimal strings (BigDecimal) or numbers — treat as `string | number`.
 */

export type Money = string | number;
export type ISODate = string; // yyyy-MM-dd
export type ISODateTime = string;

// ───────────────────────── Trade Finance — Letters of Credit (UCP 600) ─────────────────────────
export type LcStatus =
  | 'DRAFT' | 'ISSUED' | 'ADVISED' | 'AMENDED'
  | 'DOCS_PRESENTED' | 'DOCS_ACCEPTED' | 'DISCREPANT' | 'SETTLED' | 'EXPIRED' | 'CANCELLED';

export interface LetterOfCredit {
  id: string;
  tenantId: string;
  lcNumber: string;
  lcType: 'SIGHT' | 'USANCE' | 'DEFERRED' | 'REVOLVING' | 'TRANSFERABLE' | 'STANDBY';
  status: LcStatus;
  applicantName: string;
  beneficiaryName: string;
  issuingBank?: string;
  amount: Money;
  availableAmount: Money;
  settledAmount: Money;
  currency: string;
  tolerancePct?: Money;
  incoterm?: string;
  goodsDescription?: string;
  expiryDate: ISODate;
  requiredDocuments?: string; // JSON string array
  commissionAmount: Money;
  marginAmount: Money;
  schemeRef?: string;
  createdAt: ISODateTime;
  issuedAt?: ISODateTime;
  settledAt?: ISODateTime;
}

export interface IssueLcRequest {
  idempotencyKey?: string;
  lcType: string;
  applicantId?: string;
  applicantName: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  issuingBank?: string;
  amount: number;
  currency: string;
  tolerancePct?: number;
  incoterm?: string;
  goodsDescription?: string;
  latestShipmentDate?: ISODate;
  expiryDate: ISODate;
  requiredDocuments?: string[];
  marginRate?: number;
}

export interface LcPresentation {
  id: string;
  lcId: string;
  presentationNumber: number;
  status: 'SUBMITTED' | 'UNDER_EXAMINATION' | 'COMPLYING' | 'DISCREPANT' | 'WAIVED' | 'REJECTED' | 'SETTLED';
  presentedAmount: Money;
  documents?: string;
  discrepancies?: string;
  createdAt: ISODateTime;
  settledAt?: ISODateTime;
}

export interface LcAmendment {
  id: string;
  lcId: string;
  amendmentNumber: number;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
  newAmount?: Money;
  newExpiryDate?: ISODate;
  reason?: string;
  createdAt: ISODateTime;
}

// ───────────────────────── Trade Finance — Bank Guarantees (URDG 758) ───────────────────────────
export type GuaranteeStatus =
  | 'DRAFT' | 'ISSUED' | 'AMENDED' | 'CLAIMED'
  | 'CLAIM_PAID' | 'CLAIM_REJECTED' | 'EXPIRED' | 'CANCELLED' | 'RELEASED';

export interface BankGuarantee {
  id: string;
  tenantId: string;
  guaranteeNumber: string;
  guaranteeType: 'BID_BOND' | 'PERFORMANCE' | 'ADVANCE_PAYMENT' | 'FINANCIAL' | 'RETENTION' | 'WARRANTY';
  status: GuaranteeStatus;
  applicantName: string;
  beneficiaryName: string;
  guarantorBank?: string;
  amount: Money;
  claimedAmount: Money;
  currency: string;
  governingRules: 'URDG_758' | 'ISP98' | 'LOCAL';
  effectiveDate?: ISODate;
  expiryDate: ISODate;
  commissionAmount: Money;
  marginAmount: Money;
  schemeRef?: string;
  createdAt: ISODateTime;
  issuedAt?: ISODateTime;
}

export interface IssueGuaranteeRequest {
  idempotencyKey?: string;
  guaranteeType: string;
  applicantId?: string;
  applicantName: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  guarantorBank?: string;
  amount: number;
  currency: string;
  underlyingContractRef?: string;
  purpose?: string;
  governingRules?: string;
  effectiveDate?: ISODate;
  expiryDate: ISODate;
  autoExtend?: boolean;
  marginRate?: number;
}

export interface GuaranteeClaim {
  id: string;
  guaranteeId: string;
  claimNumber: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PAID' | 'REJECTED';
  claimAmount: Money;
  statement?: string;
  decisionReason?: string;
  createdAt: ISODateTime;
  paidAt?: ISODateTime;
}

// ───────────────────────── Credit — Invoice Finance ─────────────────────────
export type InvoiceStatus =
  | 'SUBMITTED' | 'ASSESSED' | 'APPROVED' | 'REJECTED' | 'FUNDED' | 'COLLECTED' | 'OVERDUE' | 'DEFAULTED';

export interface FinancedInvoice {
  id: string;
  tenantId: string;
  reference: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  sellerName: string;
  debtorName: string;
  faceAmount: Money;
  currency: string;
  dueDate: ISODate;
  advanceRate: Money;
  advanceAmount: Money;
  feeRate: Money;
  feeAmount: Money;
  reserveAmount: Money;
  collectedAmount: Money;
  riskGrade?: string;
  riskScore?: number;
  createdAt: ISODateTime;
  fundedAt?: ISODateTime;
  collectedAt?: ISODateTime;
}

export interface SubmitInvoiceRequest {
  idempotencyKey?: string;
  invoiceNumber: string;
  sellerId?: string;
  sellerName: string;
  debtorId?: string;
  debtorName: string;
  faceAmount: number;
  currency: string;
  issueDate?: ISODate;
  dueDate: ISODate;
  requestedAdvanceRate?: number;
}

// ───────────────────────── Credit — Trade BNPL ─────────────────────────
export type BnplStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE'
  | 'SETTLED' | 'DELINQUENT' | 'DEFAULTED' | 'WRITTEN_OFF' | 'CANCELLED';

export interface BnplInstallment {
  id: string;
  planId: string;
  sequenceNo: number;
  dueDate: ISODate;
  amount: Money;
  principalComponent: Money;
  interestComponent: Money;
  paidAmount: Money;
  lateFee: Money;
  status: 'DUE' | 'PAID' | 'OVERDUE' | 'WAIVED';
  paidAt?: ISODateTime;
}

export interface BnplPlan {
  id: string;
  tenantId: string;
  reference: string;
  status: BnplStatus;
  buyerName: string;
  merchantName: string;
  principal: Money;
  currency: string;
  termType: 'BULLET' | 'INSTALLMENTS';
  installmentCount: number;
  tenorDays: number;
  interestRate: Money;
  interestAmount: Money;
  totalPayable: Money;
  outstanding: Money;
  lateFees: Money;
  riskGrade?: string;
  riskScore?: number;
  createdAt: ISODateTime;
  disbursedAt?: ISODateTime;
  settledAt?: ISODateTime;
  installments?: BnplInstallment[];
}

export interface CreateBnplPlanRequest {
  idempotencyKey?: string;
  orderRef?: string;
  buyerId?: string;
  buyerName: string;
  merchantId?: string;
  merchantName: string;
  principal: number;
  currency: string;
  termType: 'BULLET' | 'INSTALLMENTS';
  installmentCount?: number;
  tenorDays?: number;
}

// ───────────────────────── FX ─────────────────────────
export interface FxRate {
  baseCurrency: string;
  quoteCurrency: string;
  midRate: Money;
  bidRate: Money;
  askRate: Money;
  source: string;
  asOf: ISODateTime;
  ttlSeconds: number;
  fresh: boolean;
}

export interface FxQuote {
  sellCurrency: string;
  buyCurrency: string;
  sellAmount: Money;
  buyAmount: Money;
  rate: Money;
  asOf: ISODateTime;
}

export interface FxConversion {
  id: string;
  tenantId: string;
  sellCurrency: string;
  buyCurrency: string;
  sellAmount: Money;
  buyAmount: Money;
  rate: Money;
  dealType: 'SPOT' | 'RATE_LOCK' | 'FORWARD';
  status: 'EXECUTED' | 'SETTLED';
  createdAt: ISODateTime;
}

export interface FxRateLock {
  id: string;
  tenantId: string;
  sellCurrency: string;
  buyCurrency: string;
  sellAmount: Money;
  buyAmount: Money;
  lockedRate: Money;
  status: 'LOCKED' | 'EXECUTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
  executedAt?: ISODateTime;
}

export interface FxForward {
  id: string;
  tenantId: string;
  sellCurrency: string;
  buyCurrency: string;
  notionalAmount: Money;
  spotRateAtBook: Money;
  forwardRate: Money;
  forwardPoints: Money;
  buyAmount: Money;
  valueDate: ISODate;
  tenorDays: number;
  marginAmount: Money;
  status: 'BOOKED' | 'SETTLED' | 'CANCELLED';
  createdAt: ISODateTime;
  settledAt?: ISODateTime;
}

// ───────────────────────── Wallet ─────────────────────────
export interface WalletBalance {
  walletId: string;
  currency: string;
  available: Money;
  held: Money;
  total: Money;
}

export interface Wallet {
  id: string;
  tenantId: string;
  holderId: string;
  holderType: 'USER' | 'ORGANIZATION' | 'MERCHANT' | 'PLATFORM';
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  defaultCurrency?: string;
  label?: string;
  createdAt: ISODateTime;
  balances?: WalletBalance[];
}

export interface WalletHold {
  id: string;
  walletId: string;
  currency: string;
  amount: Money;
  status: 'ACTIVE' | 'RELEASED' | 'CAPTURED' | 'EXPIRED';
  reference?: string;
  createdAt: ISODateTime;
  expiresAt?: ISODateTime;
}

export interface WalletEntry {
  id: string;
  walletId: string;
  currency: string;
  direction: 'CREDIT' | 'DEBIT';
  entryType: string;
  amount: Money;
  balanceAfter: Money;
  reference?: string;
  createdAt: ISODateTime;
}
