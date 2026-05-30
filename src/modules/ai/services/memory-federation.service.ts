/**
 * @file memory-federation.service.ts
 * @description Master service for Sovereign Semantic Memory and Vector Knowledge Federation.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger } from '@/services/observability-service';
import { MemoryFragment } from '../types';

class MemoryFederationService {
  private static instance: MemoryFederationService;

  private constructor() {}

  public static getInstance(): MemoryFederationService {
    if (!MemoryFederationService.instance) {
      MemoryFederationService.instance = new MemoryFederationService();
    }
    return MemoryFederationService.instance;
  }

  /**
   * Commits a cognitive artifact to the sovereign semantic memory.
   */
  async commitToMemory(fragment: Omit<MemoryFragment, 'id' | 'timestamp'>) {
    logger.info('MemoryFederation', `COMMITTING_FRAGMENT: Entity ${fragment.entityId}`);

    const res = await apiClient.post<MemoryFragment>('/ai_memory_ledger', {
      ...fragment,
      id: `MEM-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString()
    });

    return res.data!;
  }

  /**
   * Retrieves contextual knowledge using semantic retrieval (pgvector/Qdrant-ready).
   */
  async retrieveContext(query: string, companyId: string): Promise<MemoryFragment[]> {
    const res = await apiClient.get<MemoryFragment[]>('/ai_memory_ledger', {
      companyId,
      search: query,
      limit: 10
    });
    return toList(res);
  }
}

export const memoryFederation = MemoryFederationService.getInstance();
