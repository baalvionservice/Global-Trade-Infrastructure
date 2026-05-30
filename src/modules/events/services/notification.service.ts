/**
 * @file notification.service.ts
 * @description The Institutional Notification Hub.
 * Orchestrates multi-priority alerts and cross-channel signaling.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { eventBus, EventType } from '@/orchestration/event-bus';
import { logger } from '@/services/observability-service';

export type NotificationCategory = 'TRADE' | 'TREASURY' | 'LOGISTICS' | 'COMPLIANCE' | 'SYSTEM';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlatformNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  referenceId: string;
  link?: string;
  isRead: boolean;
  timestamp: string;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initializes the notification orchestrator and binds to global event triggers.
   */
  initialize() {
    logger.info('NotificationHub', 'Activating Institutional Alert Routing...');

    // 1. RFQ -> Sourcing Alert
    eventBus.subscribe('RFQ_CREATED', (payload) => this.dispatchInternal({
      category: 'TRADE',
      priority: 'LOW',
      title: 'New Sourcing Mandate',
      message: `A new RFQ (${payload.rfq_id}) has been published to the marketplace.`,
      referenceId: payload.id,
      link: `/buyer/rfqs/${payload.id}`
    }));

    // 2. Sanctions Hit -> Critical Security Alert
    eventBus.subscribe('COMPLIANCE_FAILED', (payload) => this.dispatchInternal({
      category: 'COMPLIANCE',
      priority: 'CRITICAL',
      title: 'Sanctions Breach Detected',
      message: `Critical identity drift on Node ${payload.referenceId}. Transaction isolated.`,
      referenceId: payload.referenceId,
      link: '/governance/compliance-admin/risk'
    }));

    // 3. SLA Breach -> High Operational Alert
    eventBus.subscribe('SLA_BREACH_DETECTED', (payload) => this.dispatchInternal({
      category: 'SYSTEM',
      priority: 'HIGH',
      title: 'Reliability Threshold Breached',
      message: `SLA violation detected for ${payload.entityId}. Escalation War Room required.`,
      referenceId: payload.entityId,
      link: '/governance/disputes'
    }));
  }

  private async dispatchInternal(data: Omit<PlatformNotification, 'id' | 'isRead' | 'timestamp'>) {
    const notification: PlatformNotification = {
      id: `NOTIF-${Math.random().toString(36).substring(7).toUpperCase()}`,
      isRead: false,
      timestamp: new Date().toISOString(),
      ...data
    };

    // In a production scenario, this would persist to the DB and dispatch via WebSockets
    await apiClient.post('/notifications', notification);
    
    logger.info('NotificationHub', `DISPATCHED_${data.priority}_ALERT: ${data.title}`);
  }

  async getNotifications(companyId: string): Promise<PlatformNotification[]> {
    const res = await apiClient.get<PlatformNotification[]>('/notifications', { companyId });
    return toList(res);
  }

  async markAsRead(id: string) {
    return apiClient.patch(`/notifications/${id}`, { isRead: true });
  }
}

export const notificationService = NotificationService.getInstance();
