/**
 * @file src/services/sanctions-service.ts
 * @description Master SIGINT service for Global Sanctions Screening and Geopolitical Analysis.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { SanctionSignal } from '@/types/regulatory';

class SanctionsService {
  private static instance: SanctionsService;

  private constructor() {}

  public static getInstance(): SanctionsService {
    if (!SanctionsService.instance) {
      SanctionsService.instance = new SanctionsService();
    }
    return SanctionsService.instance;
  }

  /**
   * Executes a mandatory sanctions scan for an institutional node.
   */
  async screenEntity(entityId: string, entityName: string): Promise<SanctionSignal[]> {
    logger.info('Sanctions_Oracle', `SCREENING_ENTITY: ${entityName} (Node ${entityId})`);

    // In production, this targets the Global Sanctions Registry (OFAC, UN, EU)
    const res = await apiClient.get<SanctionSignal[]>('/sanctions_signals', { entityId });
    const hits = res.data || [];

    if (hits.length > 0) {
      logger.error('Sanctions_Oracle', `CRITICAL_HIT_DETECTED: ${entityName} matches restricted lists.`);
      await eventBus.publish('SANCTIONS_HIT_DETECTED' as any, hits[0]);
      metricsService.recordMetric('sanctions_hits_total', hits.length);
    }

    return hits;
  }

  /**
   * Resolves a sanctions flag following arbiter review.
   */
  async resolveSignal(id: string, action: 'BLOCKED' | 'CLEARED', actorId: string) {
    logger.warn('Sanctions_Adjudication', `RESOLVING_SIGNAL: ${id} as ${action} by ${actorId}`);

    const res = await apiClient.patch<SanctionSignal>(`/sanctions_signals/${id}`, {
      isResolved: true,
      actionTaken: action,
      timestamp: new Date().toISOString()
    });

    return res.data!;
  }

  async getRecentSignals(limit = 10): Promise<SanctionSignal[]> {
    const res = await apiClient.get<SanctionSignal[]>('/sanctions_signals', { limit, sortBy: 'timestamp', order: 'desc' });
    return toList(res);
  }
}

export const sanctionsService = SanctionsService.getInstance();

export const blacklistEntity = async (entityId: string, reason: string) => {
  logger.warn('Sanctions_Oracle', `BLACKLIST_ENTITY: ${entityId} — ${reason}`);
  const res = await apiClient.post('/blacklist', { entityId, reason, timestamp: new Date().toISOString() });
  return res.data;
};

export const validateInstitution = async (entityId: string, entityName?: string) => {
  const hits = await sanctionsService.screenEntity(entityId, entityName || entityId);
  return { clear: hits.length === 0, hits };
};
