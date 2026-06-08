/**
 * @file src/modules/mobility/types/index.ts
 * @description Master data contracts for Sovereign Mobile Command and Field Operations.
 */

export type DeviceTrustLevel = 'UNTRUSTED' | 'VERIFIED' | 'HARDENED' | 'SOVEREIGN';
export type SyncStatus = 'SYNCHRONIZED' | 'DRIFTING' | 'OFFLINE' | 'CONFLICT';

export interface MobileSession {
  id: string;
  deviceId: string;
  actorId: string;
  trustLevel: DeviceTrustLevel;
  biometricVerified: boolean;
  location?: {
    lat: number;
    lng: number;
    jurisdiction: string;
  };
  lastHeartbeat: string;
}

export interface SyncQueueItem {
  id: string;
  entityId: string;
  action: string;
  payload: any;
  timestamp: string;
  retryCount: number;
  hash?: string; // integrity hash assigned by the backend; never client-fabricated
}

export interface FieldWorkflow {
  id: string;
  title: string;
  type: 'INSPECTION' | 'VERIFICATION' | 'INCIDENT_REPORT';
  entityId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED';
  checklist: {
    id: string;
    label: string;
    completed: boolean;
    evidenceHash?: string;
  }[];
  offlineReady: boolean;
}

export interface MobilityKPIs {
  syncLatencyMs: number;
  activeMobileNodes: number;
  edgeOperationsCount: number;
  securityAlerts: number;
}
