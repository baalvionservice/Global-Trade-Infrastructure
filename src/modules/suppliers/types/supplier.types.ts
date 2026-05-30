/**
 * @file supplier.types.ts
 * @description Master data contracts for Institutional Supplier Relationship Management (SRM).
 */

export type SupplierLifecycleStatus = 
  | 'INVITED' 
  | 'ONBOARDING' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'ACTIVE' 
  | 'PREFERRED' 
  | 'SUSPENDED' 
  | 'TERMINATED' 
  | 'ARCHIVED';

export type CertificationStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNVERIFIED';

export interface SupplierCertification {
  id: string;
  type: string;
  name: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  status: CertificationStatus;
  fileUrl?: string;
  auditTrailHash: string;
}

export interface SupplierPerformanceMetrics {
  fulfillmentRate: number; // 0-1
  avgLeadTime: string;
  qualityScore: number;
  disputeRate: number;
  esgScore: number;
  settlementFinality: number;
}

export interface SupplierProfile {
  id: string;
  name: string;
  taxId: string;
  jurisdiction: string;
  industry: string;
  description: string;
  status: SupplierLifecycleStatus;
  verificationLevel: number;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metrics: SupplierPerformanceMetrics;
  certifications: SupplierCertification[];
  activeContracts: number;
  totalTradeVolume: number;
  lastAuditAt: string;
  updatedAt: string;
}

export interface OnboardingStep {
  id: string;
  label: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  requiredRole: string;
  completedAt?: string;
}
