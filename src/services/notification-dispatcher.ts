/**
 * @file notification-dispatcher.ts
 * @description Multi-channel institutional notification engine.
 * Handles dispatching via Email, SMS, and In-App channels.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';

export type NotificationChannel = 'email' | 'sms' | 'inApp';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationPayload {
  companyId: string;
  userId?: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  type: 'system' | 'trade' | 'compliance' | 'finance';
  metadata?: any;
}

export const notificationDispatcher = {
  /**
   * Primary entry point for dispatching notifications.
   * Evaluates institutional preferences before sending.
   */
  async dispatch(payload: NotificationPayload) {
    logger.info('NotificationDispatcher', `Dispatching ${payload.type} alert for company ${payload.companyId}`);

    // 1. Fetch Institutional Preferences
    const prefRes = await apiClient.get<any[]>('/notification_preferences', { companyId: payload.companyId });
    const prefs = prefRes.data?.[0] || { email: true, sms: false, inApp: true };

    const channels: NotificationChannel[] = [];
    if (prefs.inApp) channels.push('inApp');
    if (prefs.email) channels.push('email');
    // Only SMS for high/critical priority unless explicitly configured
    if (prefs.sms || payload.priority === 'critical') channels.push('sms');

    // 2. Queue for Dispatch
    for (const channel of channels) {
      await this.queueNotification(channel, payload);
    }
  },

  /**
   * Records the notification in the audit log and "sends" it via simulated provider.
   */
  async queueNotification(channel: NotificationChannel, payload: NotificationPayload) {
    // Audit Logging
    await apiClient.post('/notification_logs', {
      channel,
      companyId: payload.companyId,
      title: payload.title,
      status: 'dispatched',
      priority: payload.priority,
      createdAt: new Date().toISOString()
    });

    switch (channel) {
      case 'inApp':
        await this.sendInApp(payload);
        break;
      case 'email':
        await this.sendEmail(payload);
        break;
      case 'sms':
        await this.sendSMS(payload);
        break;
    }
  },

  async sendInApp(payload: NotificationPayload) {
    await apiClient.post('/notifications', {
      companyId: payload.companyId,
      userId: payload.userId,
      title: payload.title,
      description: payload.message,
      type: payload.type === 'finance' ? 'order' : payload.type === 'trade' ? 'deal' : 'system',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  },

  async sendEmail(payload: NotificationPayload) {
    // Simulated SMTP / SendGrid logic
    console.log(`[SMTP SIMULATOR] Sending Email to Company ${payload.companyId}: ${payload.title}`);
  },

  async sendSMS(payload: NotificationPayload) {
    // Simulated Twilio logic
    console.log(`[SMS SIMULATOR] Sending SMS for critical alert: ${payload.title}`);
  }
};
