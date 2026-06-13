/**
 * @file edge-sync.service.ts
 * @description Master service for Offline-First synchronization and Edge Ledger reconciliation.
 */
import { useMobilityStore } from '../store/mobility.store';
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

class EdgeSyncService {
  private static instance: EdgeSyncService;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.synchronizeQueue());
      window.addEventListener('offline', () => {
        useMobilityStore.getState().setOfflineMode(true);
        useMobilityStore.getState().setSyncStatus('OFFLINE');
      });
    }
  }

  public static getInstance(): EdgeSyncService {
    if (!EdgeSyncService.instance) {
      EdgeSyncService.instance = new EdgeSyncService();
    }
    return EdgeSyncService.instance;
  }

  /**
   * Dispatches an operational mandate to the edge queue.
   */
  async dispatchMandate(action: string, entityId: string, payload: any) {
    const store = useMobilityStore.getState();
    const item = {
      id: `EDGE-${Math.random().toString(36).substring(7).toUpperCase()}`,
      action,
      entityId,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    if (store.isOfflineMode || !navigator.onLine) {
      logger.warn('EdgeSync', `OFFLINE_QUEUE: Staging action ${action} for ${entityId}`);
      store.addToSyncQueue(item);
      return { status: 'STAGED_OFFLINE', id: item.id };
    }

    try {
      await this.processItem(item);
      return { status: 'SYNCHRONIZED', id: item.id };
    } catch (e) {
      store.addToSyncQueue(item);
      store.setSyncStatus('DRIFTING');
      return { status: 'STAGED_FOR_RETRY', id: item.id };
    }
  }

  /**
   * Authoritatively synchronizes the edge queue with the platform kernel.
   */
  async synchronizeQueue() {
    const store = useMobilityStore.getState();
    const items = [...store.syncQueue];
    
    if (items.length === 0) return;

    logger.info('EdgeSync', `INITIATING_RECONCILIATION: ${items.length} signals pending.`);
    store.setSyncStatus('DRIFTING');

    for (const item of items) {
      try {
        await this.processItem(item);
        store.removeFromSyncQueue(item.id);
      } catch (e) {
        logger.error('EdgeSync', `SYNC_FAILURE: Item ${item.id} retry scheduled.`);
      }
    }

    if (store.syncQueue.length === 0) {
      store.setSyncStatus('SYNCHRONIZED');
      store.setOfflineMode(false);
      logger.info('EdgeSync', 'EDGE_LEDGER_RECONCILED: All nodes synchronized.');
    }
  }

  private async processItem(item: any) {
    // In production, this targets the Single Global Execution Kernel (SGEK)
    const res = await apiClient.post(`/events`, {
      type: item.action,
      payload: item.payload,
      metadata: {
        edgeId: item.id,
        edgeTimestamp: item.timestamp,
      }
    });

    if (!res.success) throw new Error(res.error?.message);
    
    metricsService.recordMetric('edge_sync_success_total', 1);
  }
}

export const edgeSync = EdgeSyncService.getInstance();
