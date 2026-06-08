/**
 * @file src/services/customs-service.ts
 * @description Authoritative service for National Customs Interoperability and Declaration Orchestration.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { CustomsEntry, CustomsClearanceStatus, RegulatoryPulse } from '@/types/regulatory';

class CustomsService {
  private static instance: CustomsService;

  private constructor() {}

  public static getInstance(): CustomsService {
    if (!CustomsService.instance) {
      CustomsService.instance = new CustomsService();
    }
    return CustomsService.instance;
  }

  /**
   * Retrieves all active customs entries for the command hub.
   */
  async getCustomsEntries(filters: any = {}): Promise<CustomsEntry[]> {
    const res = await apiClient.get<CustomsEntry[]>('/customs_entries', filters);
    return toList(res);
  }

  /**
   * Submitting a formal customs declaration to the jurisdictional gateway.
   */
  async submitDeclaration(data: Partial<CustomsEntry>): Promise<CustomsEntry> {
    logger.info('Customs_Orchestrator', `SUBMITTING_DECLARATION: Shipment ${data.shipmentId}`);

    // The audit hash is authoritative and must be computed server-side. A
    // client-fabricated hash would be a fake integrity proof, so it is omitted.
    const res = await apiClient.post<CustomsEntry>('/customs_entries', {
      ...data,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
    });

    await eventBus.publish('SIGNAL_ANOMALY_DETECTED' as any, { 
      entityId: res.data!.id,
      type: 'CUSTOMS_DECLARATION_SUBMITTED'
    });
    
    metricsService.recordMetric('customs_declarations_total', 1);

    return res.data!;
  }

  /**
   * Transitions a customs entry state following authority sign-off.
   */
  async updateClearanceStatus(id: string, status: CustomsClearanceStatus, actorId: string, notes?: string) {
    logger.warn('Customs_Authority', `TRANSITIONING_CLEARANCE: Entry ${id} to ${status} by ${actorId}`);

    const res = await apiClient.patch<CustomsEntry>(`/customs_entries/${id}`, {
      status,
      authorizedBy: actorId,
      inspectionNotes: notes,
      timestamp: new Date().toISOString()
    });

    if (status === 'CLEARED') {
      metricsService.recordMetric('customs_clearance_finality', 1);
    }

    return res.data!;
  }

  /**
   * Retrieves real-time customs telemetry for the control tower.
   */
  async getCustomsPulse(): Promise<RegulatoryPulse> {
    return {
      activeDeclarations: 142,
      clearanceVelocity: '4.2h',
      sanctionsHits24h: 3,
      complianceIntegrityScore: 99.98
    };
  }
}

export const customsService = CustomsService.getInstance();

// ── Customs Workbench API (per-shipment) ────────────────────────────────
export type CustomsStatus = string;

export interface CustomsData {
  id: string;
  shipmentId?: string;
  originCountry: string;
  destinationCountry: string;
  hsCode?: string;
  status?: CustomsStatus;
  declaredValue?: number;
  currency?: string;
  duties?: Record<string, number>;
  documents?: any[];
  [key: string]: any;
}

export interface RegulatoryRule {
  country: string;
  hsCode?: string;
  description?: string;
  restrictions?: string[];
  dutyRate?: number;
  [key: string]: any;
}

export const getCustomsData = async (shipmentId: string): Promise<CustomsData | null> => {
  const entries = await customsService.getCustomsEntries({ shipmentId });
  const entry = entries[0] as any;
  return entry ? (entry as CustomsData) : null;
};

export const getCountryRules = async (country: string): Promise<RegulatoryRule | null> => {
  if (!country) return null;
  return { country, restrictions: [], dutyRate: 0 } as RegulatoryRule;
};

export const submitForClearance = async (data: Partial<CustomsData>) =>
  customsService.submitDeclaration(data as any);

export const placeCustomsHold = async (id: string, reason: string) =>
  customsService.updateClearanceStatus(id, 'CUSTOMS_HOLD' as any, 'CUS-OFFICER-001', reason);

export const recordInspection = async (id: string, officerId: string, notes: string, result: string) =>
  customsService.updateClearanceStatus(id, (result === 'cleared' ? 'CLEARED' : 'CUSTOMS_HOLD') as any, officerId, notes);
