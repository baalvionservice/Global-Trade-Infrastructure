/**
 * @file base-repository.ts
 * @description UNIFIED REPOSITORY ABSTRACTION CORE.
 * The standard implementable interface for all data access across services.
 * 
 * BUILD PHASE 1: FOUNDATION STABILIZATION
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { workflowEngine } from '@/orchestration/workflow-engine';

export abstract class BaseRepository<T extends { id: string }> {
  protected collectionName: string;
  protected domain: string;

  constructor(collectionName: string, domain: string) {
    this.collectionName = collectionName;
    this.domain = domain;
  }

  /**
   * Retrieves a single entity from the live trade-service store.
   */
  async getById(id: string): Promise<T | null> {
    const res = await apiClient.getDoc<T>(this.collectionName, id);
    return res.success ? (res.data ?? null) : null;
  }

  /**
   * Queries entities based on domain filters (live, persisted).
   */
  async query(filters: any = {}): Promise<T[]> {
    const res = await apiClient.get<T[]>(`/${this.collectionName}`, filters);
    return toList<T>(res);
  }

  /**
   * Persists a new entity to the live store.
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const res = await apiClient.post<T>(`/${this.collectionName}`, data);
    return res.data as T;
  }

  /**
   * Requests a state transition via the Workflow Engine.
   * This ensures all updates follow the GST Transition Matrix.
   */
  async transition(id: string, from: string, to: string, actorId: string, payload?: any): Promise<boolean> {
    return workflowEngine.transition({
      domain: this.domain,
      entityId: id,
      from: from as any,
      to: to as any,
      actorId,
      payload
    } as any);
  }
}
