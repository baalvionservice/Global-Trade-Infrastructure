/**
 * @file src/modules/observability/types/index.ts
 * @description Master data contracts for the Baalvion Sovereign Observability Civilization.
 */

export type HealthStatus = 'OPTIMAL' | 'DEGRADED' | 'CRITICAL' | 'STABILIZING' | 'LOCKED';
export type TelemetryCategory = 'OPERATIONAL' | 'FINANCIAL' | 'INFRASTRUCTURE' | 'GOVERNANCE' | 'SECURITY';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

/**
 * THE TELEMETRY PRIMITIVE
 * Authoritative metric pulse for the planetary mesh.
 */
export interface TelemetryPoint {
  id: string;
  category: TelemetryCategory;
  metric: string;
  value: number;
  unit: string;
  nodeId: string;
  timestamp: string;
  integrityHash?: string; // SHA-256 bound to parent node — assigned server-side, never client-fabricated
}

/**
 * DISTRIBUTED TRACE SPAN
 * Maps cross-domain execution lineage.
 */
export interface TraceSpan {
  id: string;
  traceId: string;
  parentId?: string;
  domain: string;
  operation: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR' | 'REVERTED';
  actorId: string;
  metadata: Record<string, any>;
}

/**
 * OPERATIONAL INCIDENT
 * High-authority failure tracking and triage.
 */
export interface OperationalIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: 'DETECTED' | 'TRIAGE' | 'MITIGATING' | 'RESOLVED' | 'POST_MORTEM';
  impactedNodes: string[];
  rootCauseId?: string;
  mitigationWorkflowId?: string;
  createdAt: string;
  resolvedAt?: string;
}

/**
 * SYSTEMIC HEALTH MATRIX
 */
export interface PlatformHealthReport {
  overallScore: number;
  status: HealthStatus;
  activeIncidents: number;
  lastSyncAt: string;
  nodeStats: NodeHealth[];
  coherenceIndex: number;
}

export interface NodeHealth {
  nodeId: string;
  serviceName: string;
  region: string;
  status: HealthStatus;
  load: number;
  uptime: number;
  latencyMs: number;
  version: string;
}
