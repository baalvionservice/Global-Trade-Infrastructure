/**
 * @file vector-store.ts
 * @description Sovereign Semantic Memory utilizing pgvector for operational cognition.
 */
import { apiClient } from "@/lib/api-client";
import { toList } from '@/lib/api-list';
import { logger } from "@/services/observability-service";

export interface MemoryNode {
  id: string;
  vector?: number[];
  content: string;
  metadata: any;
  timestamp: string;
}

export class VectorMemory {
  /**
   * Indexes reasoning traces into the semantic fabric.
   * This builds the long-term institutional intelligence of the OS.
   */
  static async indexMissionArtifacts(missionId: string, trace: any[], status: string) {
    logger.info('AI_Memory', `INDEXING_MISSION_ARTIFACTS: ${missionId}`);

    const artifact = {
      missionId,
      trace,
      outcome: status,
      timestamp: new Date().toISOString()
    };

    // Commit to the AI Memory Ledger (Vector-Enabled)
    await apiClient.post('/ai_memory_ledger', {
      entityId: missionId,
      content: JSON.stringify(artifact),
      classification: 'FORENSIC',
      metadata: { domain: 'REASONING_TRACE', finality: 'VERIFIED' }
    });
  }

  /**
   * Performs a semantic search for contextual operational knowledge.
   */
  static async retrieveContext(query: string, limit: number = 5): Promise<string[]> {
    logger.info('AI_Memory', `RETRIEVING_SEMANTIC_CONTEXT: "${query}"`);
    const res = await apiClient.get<any[]>('/ai_memory_ledger', { search: query, limit });
    return toList(res).map(m => m.content);
  }
}
