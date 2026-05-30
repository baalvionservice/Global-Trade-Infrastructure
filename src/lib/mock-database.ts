/**
 * @file mock-database.ts
 * @description THE BAALVION PERSISTENCE KERNEL.
 * Optimized for rich institutional entities and cross-domain relationships.
 */

import { 
  Organization, 
  TradeOpportunity, 
  TradeDeal, 
  TradeOrder, 
  EscrowMandate, 
  ShipmentNode, 
  ComplianceCase,
  SimulationScenario
} from '@/types/institutional';

export interface TradeEvent {
  event_id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: any;
  triggered_by: string;
  role: string;
  timestamp: string;
  version: number;
  tenant_id: string;
  correlation_id: string;
}

class MockDatabase {
  private static instance: MockDatabase;
  
  // System of Record (Materialized Projections)
  private entities: Record<string, any[]> = {
    organizations: [],
    rfqs: [],
    deals: [],
    orders: [],
    escrows: [],
    shipments: [],
    compliance_cases: [],
    simulation_scenarios: [],
    trade_documents: [],
    wallets: [],
    ledger_entries: [],
    risk_signals: [],
    approvals: [],
    conversations: [],
    chat_messages: [],
    field_tasks: [],
    audit_logs: []
  };

  // Source of Truth (Immutable Event Store)
  private eventStore: TradeEvent[] = [];

  private constructor() {
    this.seed();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private seed() {
    this.entities.organizations = [
      { 
        id: 'COMP-101', 
        tenantId: 'T-101', 
        name: 'Beacon Tech Solutions', 
        legalEntityName: 'Beacon Tech Solutions Inc.',
        country: 'United States', 
        region: 'North America',
        type: 'buyer', 
        industry: 'Renewable Energy',
        trustScore: 942, 
        verificationStatus: 'verified', 
        verificationLevel: 4, 
        riskLevel: 'low',
        blacklistFlag: false,
        sanctionsFlag: false,
        status: 'active',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: 'COMP-102', 
        tenantId: 'T-102', 
        name: 'Global Power Systems', 
        legalEntityName: 'Global Power Systems Ltd.',
        country: 'India', 
        region: 'South Asia',
        type: 'seller', 
        industry: 'Industrial Manufacturing',
        trustScore: 884, 
        verificationStatus: 'verified', 
        verificationLevel: 3, 
        riskLevel: 'medium',
        blacklistFlag: false,
        sanctionsFlag: false,
        status: 'active',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.entities.rfqs = [
      {
        id: 'RFQ-8812',
        tenantId: 'T-101',
        orgId: 'COMP-101',
        title: 'Solar PV Modules (550W) for Utility Scale Project',
        category: 'Energy',
        quantity: { value: 2000, unit: 'Units' },
        pricing: { targetPrice: 175, currency: 'USD', pricingModel: 'FOB' },
        status: 'OPEN',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        intelligenceSignals: { demandScore: 92, competitionIndex: 'medium', successProbability: 0.84 }
      }
    ];

    this.entities.deals = [
      {
        id: 'DEAL-2001',
        tenantId: 'T-101',
        orgId: 'COMP-101',
        rfqId: 'RFQ-8812',
        productName: 'Solar PV Modules',
        buyerName: 'Beacon Tech Solutions',
        sellerName: 'Global Power Systems',
        buyerOrgId: 'COMP-101',
        sellerOrgId: 'COMP-102',
        currentPrice: 172,
        currentQuantity: 2000,
        currency: 'USD',
        status: 'NEGOTIATION',
        version: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async recordEvent(event: Omit<TradeEvent, 'event_id' | 'timestamp' | 'version'>): Promise<TradeEvent> {
    const newEvent: TradeEvent = {
      event_id: `EVT-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      version: (this.eventStore.filter(e => e.aggregate_id === event.aggregate_id).length || 0) + 1,
      ...event
    };

    this.eventStore.push(newEvent);
    await this.applyEventToProjection(newEvent);
    return newEvent;
  }

  private async applyEventToProjection(event: TradeEvent) {
    const collection = `${event.aggregate_type.toLowerCase()}s`;
    if (!this.entities[collection]) return;

    const idx = this.entities[collection].findIndex(e => e.id === event.aggregate_id);
    const data = { ...event.payload, version: event.version, updatedAt: event.timestamp };

    if (idx !== -1) {
      this.entities[collection][idx] = { ...this.entities[collection][idx], ...data };
    } else {
      this.entities[collection].push({ id: event.aggregate_id, tenantId: event.tenant_id, ...data, createdAt: event.timestamp });
    }
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    return this.entities[collection]?.find(i => i.id === id) || null;
  }

  async getAll<T>(collection: string, filters: any = {}): Promise<{ data: T[], meta: any }> {
    let data = [...(this.entities[collection] || [])];
    
    if (filters.tenantId && filters.tenantId !== 'SYSTEM_ROOT') {
      data = data.filter(i => i.tenantId === filters.tenantId);
    }

    if (filters.status) data = data.filter(i => i.status === filters.status);
    
    return { data, meta: { total: data.length, page: 1, limit: 100 } };
  }

  async insert<T>(collection: string, data: any): Promise<T> {
    const id = data.id || `${collection.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem = { 
      id, 
      version: 1, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(), 
      ...data 
    };
    if (!this.entities[collection]) this.entities[collection] = [];
    this.entities[collection].push(newItem);
    return newItem;
  }

  async update<T>(collection: string, id: string, data: any): Promise<T | null> {
    const idx = this.entities[collection]?.findIndex(i => i.id === id);
    if (idx === -1 || idx === undefined) return null;
    this.entities[collection][idx] = { ...this.entities[collection][idx], ...data, updatedAt: new Date().toISOString() };
    return this.entities[collection][idx];
  }
}

export const mockDb = MockDatabase.getInstance();
