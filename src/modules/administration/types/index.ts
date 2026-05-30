/**
 * @file index.ts
 * @description Master Data Contracts for Organization Hierarchy and Unit Management.
 */

export type OrgUnitType = 
  | 'PARENT_ENTITY' 
  | 'SUBSIDIARY' 
  | 'REGIONAL_BRANCH' 
  | 'BUSINESS_DIVISION' 
  | 'OPERATIONAL_UNIT';

export interface OrgUnit {
  id: string;
  parentId?: string;
  name: string;
  type: OrgUnitType;
  region: string;
  managerId: string;
  headcount: number;
  status: 'active' | 'suspended';
  metadata?: {
    jurisdiction?: string;
    taxId?: string;
    settlementNodes?: string[];
  };
}

export interface GovernancePolicy {
  id: string;
  name: string;
  category: 'FINANCIAL' | 'OPERATIONAL' | 'REGULATORY' | 'IDENTITY' | 'SYSTEMIC';
  enforcementMode: 'BLOCKING' | 'MONITORING' | 'GATED';
  rule: string; // Logical Rule DSL: e.g. "amount > 5000000 && role == 'FINANCE_DIRECTOR'"
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  version: number;
  lastUpdated: string;
  authorizedBy: string;
}
