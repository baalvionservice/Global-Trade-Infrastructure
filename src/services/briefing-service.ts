
/**
 * @file briefing-service.ts
 * @description Executive Briefing & Institutional Memo Service.
 */
import { apiClient } from '@/lib/api-client';

export interface StrategicBriefing {
  id: string;
  title: string;
  summary: string;
  author: string;
  priority: 'low' | 'normal' | 'high' | 'strategic';
  category: 'market' | 'risk' | 'governance' | 'infrastructure';
  createdAt: string;
}

export const briefingService = {
  async getBriefings(): Promise<StrategicBriefing[]> {
    const res = await apiClient.get<StrategicBriefing[]>('/briefings', {
      sortBy: 'createdAt',
      order: 'desc'
    });
    return res.data || [
      {
        id: 'BRIEF-101',
        title: 'Q4 Trade Corridor Efficiency Report',
        summary: 'Aggregate transit times across APAC-US corridors have improved by 14% following the implementation of automated port handshakes.',
        author: 'Chief Operations Officer',
        priority: 'strategic',
        category: 'market',
        createdAt: new Date().toISOString()
      },
      {
        id: 'BRIEF-102',
        title: 'Infrastructure Maintenance: Node Sync v4.3',
        summary: 'Planned maintenance for European gateway clusters scheduled for 2024-11-15. Zero downtime expected due to multi-node failover.',
        author: 'Platform SRE',
        priority: 'high',
        category: 'infrastructure',
        createdAt: new Date().toISOString()
      }
    ];
  },

  async createBriefing(data: Partial<StrategicBriefing>) {
    return apiClient.post('/briefings', data);
  }
};
