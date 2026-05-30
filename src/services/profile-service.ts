
/**
 * @file src/services/profile-service.ts
 * @description Enhanced profile service for managing institutional identity and account productization.
 */
import { UserRole } from '@/app/(dashboard)/_components/app-state';
import { apiClient } from '@/lib/api-client';

export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'not_started';
export type BadgeLevel = 'basic' | 'verified' | 'premium';
export type RiskLevel = 'low' | 'medium' | 'high';
export type SubscriptionTier = 'starter' | 'business' | 'enterprise' | 'sovereign';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  kycStatus: KYCStatus;
  amlRiskScore: number;
  avatarUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  type?: string;
  country: string;
  industry: string;
  description: string;
  website: string;
  badge: BadgeLevel;
  subscriptionTier: SubscriptionTier;
  foundedYear: number;
  certifications: string[];
  registrationNumber?: string;
  verificationStatus?: KYCStatus;
  trustScore?: number;
  riskLevel?: RiskLevel;
  riskScore?: number;
  sanctionsFlag?: boolean;
  blacklistFlag?: boolean;
  lastRiskReviewAt?: string;
  usageMetrics: {
    rfqs: number;
    shipments: number;
    settlements: number;
  };
}

export interface TrustMetrics {
  score: number;
  completedOrders: number;
  responseRate: number;
  avgResponseTime: string;
}

const API_LATENCY = 600;

export async function getProfile(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      id: 'USR-101',
      name: 'Alexander Chen',
      email: 'a.chen@global-trade.com',
      role: 'Institutional Buyer' as any,
      companyId: 'COMP-101',
      kycStatus: 'verified',
      amlRiskScore: 12,
    }), API_LATENCY);
  });
}

export async function getCompany(id: string): Promise<Company | null> {
  const res = await apiClient.get<Company>(`/companies/${id}`);
  
  // Simulation enhancement for productization metrics
  if (res.data) {
    return {
      ...res.data,
      subscriptionTier: 'business',
      usageMetrics: {
        rfqs: 42,
        shipments: 124,
        settlements: 12400000
      }
    };
  }
  return null;
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<Company | null> {
  const res = await apiClient.patch<Company>(`/companies/${id}`, data);
  return res.data;
}

export async function getTrustMetrics(companyId: string): Promise<TrustMetrics> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      score: 942,
      completedOrders: 128,
      responseRate: 98,
      avgResponseTime: '< 2 hours',
    }), API_LATENCY);
  });
}
