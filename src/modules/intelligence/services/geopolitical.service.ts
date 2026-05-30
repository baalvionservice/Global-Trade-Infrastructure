/**
 * @file geopolitical.service.ts
 * @description Sovereign Geopolitical Risk monitoring — backed by the live trade-service
 * store (/geopolitical_alerts). Persisted, real, tenant-scoped.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { GeopoliticalAlert } from '../types';

class GeopoliticalService {
  private static instance: GeopoliticalService;
  private constructor() {}
  public static getInstance(): GeopoliticalService {
    if (!GeopoliticalService.instance) GeopoliticalService.instance = new GeopoliticalService();
    return GeopoliticalService.instance;
  }

  async getActiveAlerts(): Promise<GeopoliticalAlert[]> {
    const res = await apiClient.get<GeopoliticalAlert[]>('/geopolitical_alerts', { sortBy: 'impactScore', order: 'desc' });
    return toList<GeopoliticalAlert>(res);
  }
}

export const geopoliticalService = GeopoliticalService.getInstance();
