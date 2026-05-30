/**
 * @file verification-service.ts
 * @description Service for managing institutional identity and KYC/KYB flows.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationRequest {
  id: string;
  companyId: string;
  documentType: 'business_license' | 'tax_certificate' | 'identity_proof';
  fileName: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export async function submitKYC(data: { companyId: string; documentType: string; fileName: string }) {
  // 1. Create the verification record
  const res = await apiClient.post('/verification_requests', {
    ...data,
    status: 'pending',
    uploadedAt: new Date().toISOString()
  });

  // 2. Update company status to pending
  if (res.success) {
    await apiClient.patch(`/companies/${data.companyId}`, { verificationStatus: 'pending' });
  }

  return res;
}

export async function getPendingVerifications() {
  return apiClient.get<VerificationRequest[]>('/verification_requests', { status: 'pending' });
}

export async function approveVerification(requestId: string, companyId: string) {
  // 1. Approve the request
  await apiClient.patch(`/verification_requests/${requestId}`, { status: 'approved' });

  // 2. Set company as verified and boost trust score
  return apiClient.patch(`/companies/${companyId}`, { 
    verificationStatus: 'verified',
    trustScore: 75 // Base verified score
  });
}

export async function rejectVerification(requestId: string, companyId: string) {
  await apiClient.patch(`/verification_requests/${requestId}`, { status: 'rejected' });
  return apiClient.patch(`/companies/${companyId}`, { verificationStatus: 'rejected' });
}

export function getTrustBadgeConfig(score: number) {
  if (score >= 90) return { label: 'Tier 1 Trust', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  if (score >= 70) return { label: 'Verified Partner', color: 'bg-green-100 text-green-700 border-green-200' };
  if (score >= 40) return { label: 'Established', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  return { label: 'New Member', color: 'bg-muted text-muted-foreground border-border' };
}

export async function calculateTrustScore(companyId: string): Promise<number> {
  // Mock logic for scoring:
  // Base 0
  // Verified +50
  // Transactions +10 each
  // Disputes -20
  
  const [companyRes, ordersRes, disputesRes] = await Promise.all([
    apiClient.get<any>(`/companies/${companyId}`),
    apiClient.get<any[]>('/orders', { company_id: companyId }),
    apiClient.get<any[]>('/disputes', { parties: companyId }) // Mock search
  ]);

  let score = 0;
  if (companyRes.data?.verificationStatus === 'verified') score += 50;
  
  const orderCount = toList(ordersRes).length;
  score += orderCount * 10;

  const disputeCount = toList(disputesRes).length;
  score -= disputeCount * 20;

  return Math.max(0, Math.min(100, score));
}
