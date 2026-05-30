/**
 * @file src/types/regulatory.ts
 * @description Master data contracts for Sovereign Customs, Compliance, and Geopolitical Intelligence.
 */

import { RiskLevel, LifecycleStatus } from "./institutional";

export type CustomsClearanceStatus = 
  | 'PENDING' 
  | 'DOCUMENTS_VERIFIED' 
  | 'UNDER_INSPECTION' 
  | 'DUTIES_PAID' 
  | 'CLEARED' 
  | 'HOLD' 
  | 'REJECTED';

export interface CustomsEntry {
  id: string;
  shipmentId: string;
  orderId: string;
  htsCode: string;
  description: string;
  originCountry: string;
  destinationCountry: string;
  declaredValue: number;
  currency: string;
  dutiesCalculated: number;
  taxesCalculated: number;
  status: CustomsClearanceStatus;
  authorizedBy?: string;
  inspectionNotes?: string;
  timestamp: string;
  auditHash: string;
}

export interface SanctionSignal {
  id: string;
  entityId: string;
  entityName: string;
  type: 'OFAC' | 'UN' | 'EU' | 'LOCAL';
  severity: RiskLevel;
  matchConfidence: number;
  description: string;
  isResolved: boolean;
  actionTaken?: 'BLOCKED' | 'FLAGGED' | 'CLEARED';
  timestamp: string;
}

export interface RegulatoryRule {
  id: string;
  jurisdiction: string;
  category: 'IMPORT' | 'EXPORT' | 'TRANSIT' | 'SANCTION';
  ruleType: 'RESTRICTION' | 'TARIFF' | 'QUOTA' | 'CERTIFICATION';
  description: string;
  conditions: string;
  isActive: boolean;
  version: number;
}

export interface TradeCorridorHealth {
  corridorId: string;
  origin: string;
  destination: string;
  averageClearanceTime: string;
  congestionLevel: number;
  riskIndex: number;
  status: 'STABLE' | 'CONGESTED' | 'RESTRICTED';
}

export interface RegulatoryPulse {
  activeDeclarations: number;
  clearanceVelocity: string;
  sanctionsHits24h: number;
  complianceIntegrityScore: number;
}
