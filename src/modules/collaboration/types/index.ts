/**
 * @file src/modules/collaboration/types/index.ts
 * @description Master contracts for Institutional Real-Time Collaboration and Synchronization.
 */

export type WorkspaceType = 'SOURCING' | 'TREASURY' | 'LOGISTICS' | 'COMPLIANCE' | 'GOVERNANCE';
export type CollaborationStatus = 'IDLE' | 'ACTIVE' | 'SYNCING' | 'ESCALATED';

export interface CollaborationWorkspace {
  id: string;
  title: string;
  type: WorkspaceType;
  entityId: string; // Linked Trade Entity (RFQ, Order, etc.)
  status: CollaborationStatus;
  activeUsers: string[]; // List of UserNode IDs
  lastSignal: string;
  coherenceScore: number; // 0-100
  metadata?: Record<string, any>;
}

export interface OperationalPresence {
  userId: string;
  name: string;
  role: string;
  currentWorkspaceId?: string;
  operationalStatus: 'AVAILABLE' | 'IN_FLOW' | 'ON_CALL' | 'OFFLINE';
  lastHeartbeat: string;
}

export interface OperationalAnnotation {
  id: string;
  workspaceId: string;
  entityPath: string; // e.g., "order.pricing.amount"
  authorId: string;
  content: string;
  versionHash: string; // Linked to ledger version
  isResolved: boolean;
  createdAt: string;
}

export interface SynchronizationState {
  syncId: string;
  clusterId: string;
  operationalHealth: 'DETERMINISTIC' | 'DRIFTING' | 'UNSYNCED';
  latencyMs: number;
  lastCheckpoint: string;
}

export interface CollaborationSignal {
  id: string;
  type: 'PRESENCE_BURST' | 'HANDSHAKE_REQUEST' | 'SIGN_OFF_COMPLETED' | 'ANNOTATION_ADDED';
  actorId: string;
  workspaceId: string;
  payload: any;
  timestamp: string;
}
