/**
 * @file institutional.ts
 * @description THE AUTHORITATIVE BAALVION TRADE ONTOLOGY.
 * Enhanced: Hardened Execution and Logistics nodes for Mission Control integration.
 */

export type LifecycleStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'OPEN' 
  | 'NEGOTIATION' 
  | 'FINALIZED' 
  | 'COMMITTED' 
  | 'BOOKED'
  | 'PICKED_UP'
  | 'IN_TRANSIT' 
  | 'PORT_PROCESSING'
  | 'CUSTOMS_CLEARANCE'
  | 'CUSTOMS_HOLD'
  | 'RELEASED'
  | 'DELIVERED' 
  | 'SETTLED' 
  | 'DISPUTED' 
  | 'CLOSED' 
  | 'CANCELLED' 
  | 'RESTRICTED'
  | 'DELAYED'
  | 'ISSUED'
  | 'ADVISED'
  | 'ACCEPTED'
  | 'PAID'
  | 'UNDER_INVESTIGATION'
  | 'EVIDENCE_COLLECTION'
  | 'MEDIATION'
  | 'ARBITRATION'
  | 'RESOLVED'
  | 'AUTHORIZED'
  | 'EXECUTED'
  | 'SUPERSEDED'
  | 'RE-ROUTED'
  | 'ARRIVAL_PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'pending' | 'confirmed' | 'cancelled' | 'shipped' | 'delivered'
  | 'in_transit' | 'picked_up' | 'processing' | 'customs_clearance' | 'completed'
  | 'created' | 'active';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

export interface BaseEntity {
  id: string;
  tenantId?: string;
  orgId?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface Milestone {
  id: string;
  status: LifecycleStatus;
  location: string;
  timestamp: string;
  notes?: string;
  isVerified: boolean;
  verifiedBy?: string;
  evidenceHash?: string;
  [key: string]: any;
}

export interface ShipmentNode extends BaseEntity {
  orderId: string;
  carrierId: string;
  carrierName: string;
  trackingNumber: string;
  vesselName?: string;
  containerId?: string;
  origin: string;
  destination: string;
  status: LifecycleStatus;
  estimatedArrival: string;
  actualArrival?: string;
  iotTelemetryStream: string; 
  value: number;
  currency: string;
  milestones: Milestone[];
  activeExceptions: OperationalException[];
}

export interface OperationalException {
  id: string;
  type: 'DELAY' | 'CUSTOMS_BLOCK' | 'TEMPER_ALERT' | 'ROUTE_DEVIATION';
  severity: RiskLevel;
  message: string;
  isResolved: boolean;
  createdAt: string;
  [key: string]: any;
}

export interface TradeOrder extends BaseEntity {
  dealId: string;
  buyerId: string;
  sellerId: string;
  product: string;
  quantity: number;
  price: number;
  totalValue: number;
  currency: string;
  status: LifecycleStatus;
  fulfillmentState: 'PENDING' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED';
  logisticsId?: string;
}

// ── Marketplace & Sourcing ──────────────────────────────────────────────
export interface RFQ extends BaseEntity {
  buyerId: string;
  buyerName?: string;
  product: string;
  category?: string;
  quantity: number;
  unit?: string;
  targetPrice?: number;
  currency: string;
  incoterm?: string;
  deadline?: string;
  destination?: string;
  status: LifecycleStatus;
  quotes?: Quotation[];
  description?: string;
  [key: string]: any;
}

export interface Quotation extends BaseEntity {
  rfqId: string;
  sellerId: string;
  sellerName?: string;
  price: number;
  currency: string;
  leadTime?: string;
  validity?: string;
  terms?: string;
  status: LifecycleStatus;
  [key: string]: any;
}

export interface TradeOpportunity extends BaseEntity {
  title: string;
  product?: string;
  counterparty?: string;
  country?: string;
  value?: number;
  currency?: string;
  matchScore?: number;
  status: LifecycleStatus;
  [key: string]: any;
}

export interface TradeSignal extends BaseEntity {
  type: string;
  severity: RiskLevel;
  message: string;
  source?: string;
  commodity?: string;
  [key: string]: any;
}

// ── Deal Room & Negotiation ─────────────────────────────────────────────
export interface Message {
  id: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  body: string;
  timestamp: string;
  attachments?: any[];
  type?: 'message' | 'offer' | 'counter' | 'system';
  [key: string]: any;
}

export interface TradeDeal extends BaseEntity {
  rfqId?: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  product: string;
  quantity: number;
  price: number;
  totalValue: number;
  currency: string;
  incoterm?: string;
  status: LifecycleStatus;
  messages?: Message[];
  agreedTerms?: Record<string, any>;
  milestones?: Milestone[];
  [key: string]: any;
}

// ── Organizations & Identity ────────────────────────────────────────────
export interface Organization extends BaseEntity {
  name: string;
  legalName?: string;
  country: string;
  type?: 'BUYER' | 'SELLER' | 'BANK' | 'AGENT' | 'GOVERNMENT' | 'DEVELOPER';
  trustScore?: number;
  kycStatus?: string;
  tier?: string;
  [key: string]: any;
}

// ── Compliance, Disputes & Evidence ─────────────────────────────────────
export interface ComplianceCase extends BaseEntity {
  entityId: string;
  entityType?: string;
  caseType?: 'KYC' | 'AML' | 'SANCTIONS' | 'PEP';
  riskScore?: number;
  riskLevel?: RiskLevel;
  status: LifecycleStatus;
  flags?: string[];
  [key: string]: any;
}

export interface EvidenceRecord {
  id: string;
  caseId?: string;
  type: string;
  uri?: string;
  hash?: string;
  submittedBy?: string;
  timestamp: string;
  [key: string]: any;
}

export interface DisputeCase extends BaseEntity {
  tradeId: string;
  raisedBy: string;
  reason: string;
  tier?: 1 | 2 | 3;
  status: LifecycleStatus;
  evidence?: EvidenceRecord[];
  resolution?: string;
  arbitrator?: string;
  [key: string]: any;
}

// ── Finance & Treasury ──────────────────────────────────────────────────
export interface EscrowMandate extends BaseEntity {
  tradeId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: LifecycleStatus;
  releaseConditions?: string[];
  [key: string]: any;
}

export interface TreasuryPosition extends BaseEntity {
  currency: string;
  balance: number;
  available: number;
  reserved?: number;
  [key: string]: any;
}

// ── Governance & Command ────────────────────────────────────────────────
export interface ExecutiveDirective extends BaseEntity {
  title: string;
  issuedBy?: string;
  priority?: RiskLevel;
  status: LifecycleStatus;
  body?: string;
  [key: string]: any;
}

export interface SimulationScenario extends BaseEntity {
  name: string;
  category?: string;
  parameters?: Record<string, any>;
  outcome?: string;
  status: LifecycleStatus;
  [key: string]: any;
}

// ── IoT & Telemetry ─────────────────────────────────────────────────────
export interface TelemetryReading {
  id?: string;
  deviceId?: string;
  metric?: string;
  value?: number;
  unit?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface IotDevice extends BaseEntity {
  deviceType: string;
  shipmentId?: string;
  status: string;
  lastReading?: TelemetryReading;
  [key: string]: any;
}
