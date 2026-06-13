/**
 * @file index.ts
 * @description Master Security, IAM, and Tenant Data Contracts for the Sovereign Cyber Defense Layer.
 */
import { UserRole } from "@/core/roles";

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ISOLATED' | 'PROVISIONING' | 'LOCKED';
export type IdentityStatus = 'VERIFIED' | 'REVOKED' | 'LOCKED' | 'PENDING' | 'ELEVATED';
export type SecuritySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ThreatCategory = 'CYBER' | 'PHYSICAL' | 'FINANCIAL' | 'IDENTITY' | 'GEOPOLITICAL';

export interface TenantBoundary {
  id: string;
  institutionName: string;
  jurisdiction: string;
  clusterNode: string;
  status: TenantStatus;
  riskScore: number;
  dataResidency: 'SOVEREIGN_SWISS' | 'US_EAST' | 'APAC_SOUTH' | 'EU_CENTRAL';
  activeSessions?: number; // real session count from the backend; absent when not provided
  updatedAt: string;
}

export interface SecurityRole {
  id: string;
  name: UserRole;
  category: 'EXECUTIVE' | 'FINANCE' | 'OPERATIONS' | 'COMPLIANCE' | 'SYSTEM';
  permissionCount: number;
  assignedUsers: number;
  trustRequirement: number; // 0-100 threshold for sensitive actions
}

export interface ThreatSignal {
  id: string;
  category: ThreatCategory;
  severity: SecuritySeverity;
  sourceNode: string;
  message: string;
  timestamp: string;
  isNeutralized: boolean;
  attackChainId?: string;
  metadata?: any;
}

export interface SecurityAuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'DENIED' | 'ESCALATED';
  severity: SecuritySeverity;
  ipAddress: string;
  timestamp: string;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    previousState?: any;
    currentState?: any;
    signature?: string;
  };
}

export interface PrivilegedSession {
  id: string;
  actorId: string;
  tenantId: string;
  scope: string;
  reason: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  biometricVerified: boolean;
}
