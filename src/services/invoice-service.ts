/**
 * @file invoice-service.ts
 * @description Client for the invoice-service (financial-services-java :13021) via the `/finance-bff`
 * gateway path. Backs three product modules from one system of record: Invoice Management, Accounts
 * Receivable, and Accounts Payable. Tenant is injected server-side by the auth-gateway from the
 * session JWT — callers never pass an org id. No mock data.
 */
import { financeClient, pageContent, type Page } from '@/lib/finance-client';

export type InvoiceDirection = 'RECEIVABLE' | 'PAYABLE';
export type InvoiceStatus =
  | 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'DISPUTED';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  direction: InvoiceDirection;
  counterpartyName: string;
  counterpartyId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  orderId?: string;
  notes?: string;
  lineItems?: InvoiceLineItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceInput {
  direction: InvoiceDirection;
  counterpartyName: string;
  counterpartyId?: string;
  currency: string;
  lineItems: InvoiceLineItem[];
  taxAmount?: number;
  dueDate?: string;
  orderId?: string;
  notes?: string;
}

export interface AgingSummary {
  direction: InvoiceDirection;
  currency?: string | null;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOutstanding: number;
  invoiceCount: number;
}

export interface InvoiceMetrics {
  countsByStatus: Record<string, number>;
  totalOutstandingReceivable: number;
  totalOutstandingPayable: number;
  overdueCount: number;
  overdueAmount: number;
}

interface ListParams { direction?: InvoiceDirection; status?: InvoiceStatus | ''; page?: number; size?: number }

export async function listInvoices(params: ListParams = {}): Promise<Invoice[]> {
  const res = await financeClient.get<Page<Invoice>>('/invoices', { size: 200, ...params });
  return pageContent<Invoice>(res.data);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const res = await financeClient.get<Invoice>(`/invoices/${id}`);
  return res.data ?? null;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice | null> {
  const res = await financeClient.post<Invoice>('/invoices', input);
  return res.data ?? null;
}

export async function issueInvoice(id: string): Promise<Invoice | null> {
  const res = await financeClient.post<Invoice>(`/invoices/${id}/issue`);
  return res.data ?? null;
}

export async function recordInvoicePayment(
  id: string,
  amount: number,
  currency: string,
  reference?: string,
): Promise<Invoice | null> {
  const res = await financeClient.post<Invoice>(`/invoices/${id}/payments`, { amount, currency, reference });
  return res.data ?? null;
}

export async function cancelInvoice(id: string): Promise<Invoice | null> {
  const res = await financeClient.post<Invoice>(`/invoices/${id}/cancel`);
  return res.data ?? null;
}

export async function disputeInvoice(id: string): Promise<Invoice | null> {
  const res = await financeClient.post<Invoice>(`/invoices/${id}/dispute`);
  return res.data ?? null;
}

export async function getInvoiceMetrics(): Promise<InvoiceMetrics | null> {
  const res = await financeClient.get<InvoiceMetrics>('/invoices/metrics');
  return res.data ?? null;
}

export async function getReceivablesAging(): Promise<AgingSummary | null> {
  const res = await financeClient.get<AgingSummary>('/receivables/summary');
  return res.data ?? null;
}

export async function getPayablesAging(): Promise<AgingSummary | null> {
  const res = await financeClient.get<AgingSummary>('/payables/summary');
  return res.data ?? null;
}
