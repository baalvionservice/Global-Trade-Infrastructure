
/**
 * @file field-service.ts
 * @description Field Operations & Operational Checklist Service.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';

export interface OperationalTask {
  id: string;
  entityId: string;
  type: 'inspection' | 'intake' | 'dispatch' | 'seal_verification';
  title: string;
  checklist: { id: string; label: string; completed: boolean }[];
  status: 'pending' | 'completed' | 'flagged';
  location: string;
}

export const fieldService = {
  async getTasks(location?: string): Promise<OperationalTask[]> {
    const res = await apiClient.get<OperationalTask[]>('/field_tasks', location ? { location } : {});
    return res.data || [
      {
        id: 'TASK-001',
        entityId: 'SHP-4421',
        type: 'seal_verification',
        title: 'Container Seal Audit: MAE-4482',
        location: 'Shanghai Port Terminal 4',
        status: 'pending',
        checklist: [
          { id: '1', label: 'Verify Physical Seal ID matches Manifest', completed: false },
          { id: '2', label: 'Inspect for tamper evidence', completed: false },
          { id: '3', label: 'Log IoT Battery Status', completed: false }
        ]
      },
      {
        id: 'TASK-002',
        entityId: 'SHP-9921',
        type: 'inspection',
        title: 'Pre-Shipment Quality Check',
        location: 'Warehouse Hub - Alpha',
        status: 'pending',
        checklist: [
          { id: '1', label: 'Confirm unit count: 2,000 Units', completed: false },
          { id: '2', label: 'Safety signage verification', completed: false }
        ]
      }
    ];
  },

  async completeTask(taskId: string, notes?: string) {
    logger.info('FieldOps', `TASK_COMPLETED: ${taskId}`, { notes });
    return apiClient.patch(`/field_tasks/${taskId}`, { status: 'completed', notes });
  },

  async flagTask(taskId: string, reason: string) {
    logger.error('FieldOps', `TASK_FLAGGED: ${taskId}`, { reason });
    return apiClient.patch(`/field_tasks/${taskId}`, { status: 'flagged', reason });
  }
};
