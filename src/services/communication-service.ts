/**
 * @file src/services/communication-service.ts
 * @description The authoritative service for Institutional Communication and Organizational Synchronization.
 * Orchestrates dialogue nodes, operational threads, and multi-priority notifications.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { resolveSessionOrgId } from './session-org';

export type ContextType = 'rfq' | 'deal' | 'order' | 'general' | 'incident' | 'compliance' | 'treasury' | 'logistics';

export interface Conversation {
  id: string;
  participants: string[];
  contextType: ContextType;
  contextId: string;
  contextTitle: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  isWarRoom?: boolean;
  securityProtocol: 'AUTH_V4' | 'SEC_PROT_V4';
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  senderRole: string;
  content: string;
  type: 'text' | 'system' | 'offer' | 'attachment' | 'directive' | 'escalation';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'message' | 'deal' | 'order' | 'system' | 'compliance' | 'finance' | 'logistics';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  link: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledgedAt?: string;
}

class CommunicationService {
  private static instance: CommunicationService;

  private constructor() {}

  public static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  /**
   * Retrieves the high-density Institutional Inbox.
   */
  async getInbox(companyId: string): Promise<Conversation[]> {
    const res = await apiClient.get<Conversation[]>('/conversations', {
      companyId,
      sortBy: 'updatedAt',
      order: 'desc'
    });
    return res.data || [
       { id: 'C-1', participants: ['Beacon Tech', 'Energy Corp'], contextType: 'deal', contextId: 'DEAL-2001', contextTitle: 'Solar PV Mandate', lastMessage: 'Treasury handshake confirmed. Locking FX rate.', updatedAt: new Date().toISOString(), unreadCount: 2, securityProtocol: 'AUTH_V4', priority: 'high' },
       { id: 'C-2', participants: ['Standard Chartered', 'Beacon Tech'], contextType: 'treasury', contextId: 'ESC-5002', contextTitle: 'Escrow Liquidity Staging', lastMessage: 'Verification level 4 reached.', updatedAt: new Date().toISOString(), unreadCount: 0, securityProtocol: 'AUTH_V4', priority: 'normal' },
       { id: 'C-3', participants: ['GLOBAL_ARBITER', 'Logistics_Lead'], contextType: 'incident', contextId: 'DS-992', contextTitle: 'Port Congestion War Room', lastMessage: 'Autonomous rerouting proposed.', updatedAt: new Date().toISOString(), unreadCount: 0, isWarRoom: true, securityProtocol: 'SEC_PROT_V4', priority: 'critical' }
    ];
  }

  /**
   * Provisions a secure Dialogue Node linked to an operational entity.
   */
  async provisionThread(data: {
    contextId: string;
    contextType: ContextType;
    title: string;
    participants: string[];
    priority?: Conversation['priority'];
  }): Promise<Conversation> {
    logger.info('CommService', `PROVISIONING_THREAD: ${data.title} for ${data.contextId}`);

    const res = await apiClient.post<Conversation>('/conversations', {
      ...data,
      contextTitle: data.title,
      lastMessage: 'THREAD_INITIALIZED',
      unreadCount: 0,
      securityProtocol: 'AUTH_V4',
      priority: data.priority || 'normal',
      updatedAt: new Date().toISOString()
    });

    return res.data!;
  }

  /**
   * Dispatches a critical Escalation War Room mandate.
   */
  async provisionWarRoom(data: {
    contextId: string;
    contextType: ContextType;
    title: string;
    participants: string[];
  }): Promise<Conversation> {
    logger.error('CommService', `WAR_ROOM_MANDATE: ${data.title}`);

    const res = await apiClient.post<Conversation>('/conversations', {
      ...data,
      contextTitle: data.title,
      lastMessage: 'WAR_ROOM_PROVISIONED',
      isWarRoom: true,
      priority: 'critical',
      securityProtocol: 'SEC_PROT_V4',
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    });

    metricsService.recordMetric('war_rooms_provisioned', 1);
    
    return res.data!;
  }

  /**
   * Syncs historical messages for a dialogue node.
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>('/chat_messages', {
      conversationId,
      sortBy: 'createdAt',
      order: 'asc'
    });
    return toList(res);
  }

  /**
   * Authorizes and sends a message to the institutional ledger.
   */
  async sendMessage(convId: string, sender: string, content: string, type: ChatMessage['type'] = 'text'): Promise<ChatMessage> {
    const res = await apiClient.post<ChatMessage>('/chat_messages', {
      conversationId: convId,
      sender,
      senderRole: 'Authorized Node',
      content,
      type,
      createdAt: new Date().toISOString()
    });

    await apiClient.patch(`/conversations/${convId}`, {
      lastMessage: content,
      updatedAt: new Date().toISOString()
    });

    return res.data!;
  }

  /**
   * Retrieves multi-priority notifications for the current institution.
   */
  async getNotifications(companyId: string): Promise<Notification[]> {
    const res = await apiClient.get<unknown>('/notifications', {
      companyId,
      sortBy: 'createdAt',
      order: 'desc'
    });
    // /notifications is a paginated typed resource → { data: { items, total, page, limit } }.
    // Tolerate both the paginated envelope and a bare array so the header never crashes.
    const d = res.data as { items?: Notification[] } | Notification[] | null;
    return Array.isArray(d) ? d : (d?.items ?? []);
  }
}

export const communicationService = CommunicationService.getInstance();

// Legacy export compatibility. Inbox + notifications are scoped to the authenticated org;
// resolve the real org id from the session and return empty when anonymous (never a fixed tenant).
export const getConversations = async (): Promise<Conversation[]> => {
  const orgId = await resolveSessionOrgId();
  return orgId ? communicationService.getInbox(orgId) : [];
};
export const getConversationById = (id: string) => apiClient.getDoc<Conversation>('/conversations', id).then(r => r.data);
export const getConversationMessages = (id: string) => communicationService.getMessages(id);
export const postMessage = (id: string, sender: string, content: string) => communicationService.sendMessage(id, sender, content);
export const getNotifications = async (): Promise<Notification[]> => {
  const orgId = await resolveSessionOrgId();
  return orgId ? communicationService.getNotifications(orgId) : [];
};
export const markNotificationAsRead = (id: string) => apiClient.patch(`/notifications/${id}`, { isRead: true });
export const provisionWarRoom = (data: any) => communicationService.provisionWarRoom(data);
