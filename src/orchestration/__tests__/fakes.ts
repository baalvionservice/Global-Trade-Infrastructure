/**
 * @file orchestration/__tests__/fakes.ts
 * @description In-memory port fakes for deterministic, network-free kernel tests.
 */
import { InMemoryWorkflowStore } from '../workflow-engine';
import { TradeLifecycleState } from '../lifecycle';
import {
  OrchestrationPorts,
  TradeExecutionPort,
  RiskEnginePort,
  CompliancePort,
  PricingPort,
  NotificationPort,
  AuditSinkPort,
  AuditEntry,
  NotificationMessage,
  ExecutionResult,
  TradeContext,
} from '../ports';
import { TradeTerms } from '../ports';
import { USER_ROLES, UserRole } from '@/core/roles';

export interface FakeHarness {
  ports: OrchestrationPorts;
  store: InMemoryWorkflowStore;
  execCalls: TradeLifecycleState[];
  compensated: TradeLifecycleState[];
  notifications: NotificationMessage[];
  auditEntries: AuditEntry[];
}

export interface FakeOptions {
  failOn?: TradeLifecycleState[];
  compliancePass?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export function buildFakePorts(opts: FakeOptions = {}): FakeHarness {
  const execCalls: TradeLifecycleState[] = [];
  const compensated: TradeLifecycleState[] = [];
  const notifications: NotificationMessage[] = [];
  const auditEntries: AuditEntry[] = [];
  const failOn = new Set<TradeLifecycleState>(opts.failOn ?? []);

  const execution: TradeExecutionPort = {
    async execute(state: TradeLifecycleState, ctx: TradeContext): Promise<ExecutionResult> {
      execCalls.push(state);
      if (failOn.has(state)) {
        throw new Error(`exec_fail_${state}`);
      }
      const id = ctx.refs.tradeId;
      switch (state) {
        case 'RFQ_CREATED':
          return { refs: { rfqId: `rfq-${id}` } };
        case 'DEAL_CREATED':
          return { refs: { dealId: `deal-${id}` } };
        case 'ORDER_CREATED':
          return { refs: { orderId: `ord-${id}` } };
        case 'ESCROW_CREATED':
          return { refs: { escrowId: `esc-${id}` } };
        case 'SHIPMENT_CREATED':
          return { refs: { shipmentId: `shp-${id}` } };
        case 'SETTLEMENT_COMPLETED':
          return { refs: { settlementId: `set-${id}` } };
        default:
          return {};
      }
    },
    async compensate(state: TradeLifecycleState): Promise<void> {
      compensated.push(state);
    },
  };

  const risk: RiskEnginePort = {
    async assess() {
      return { score: 10, level: opts.riskLevel ?? 'low', factors: [] };
    },
  };

  const compliance: CompliancePort = {
    async screen() {
      const passed = opts.compliancePass !== false;
      return {
        passed,
        sanctions: !passed,
        kycVerified: passed,
        reasons: passed ? [] : ['kyc_pending'],
      };
    },
  };

  const pricing: PricingPort = {
    async quote(ctx: TradeContext) {
      return {
        unitPrice: ctx.terms.unitPrice,
        totalPrice: ctx.terms.unitPrice * ctx.terms.quantity,
        currency: ctx.terms.currency,
        fxRate: 1,
      };
    },
  };

  const notification: NotificationPort = {
    async notify(_ctx: TradeContext, message: NotificationMessage) {
      notifications.push(message);
    },
  };

  const store = new InMemoryWorkflowStore();

  const audit: AuditSinkPort = {
    async record(entry: AuditEntry) {
      auditEntries.push(entry);
    },
  };

  const ports: OrchestrationPorts = {
    execution,
    risk,
    compliance,
    pricing,
    notification,
    store,
    audit,
  };

  return { ports, store, execCalls, compensated, notifications, auditEntries };
}

export const SAMPLE_TERMS: TradeTerms = {
  buyerId: 'ORG-BUYER',
  sellerId: 'ORG-SELLER',
  commodity: 'ARABICA_COFFEE',
  quantity: 100,
  unitPrice: 12.5,
  currency: 'USD',
  incoterm: 'FOB',
  originCountry: 'BR',
  destinationCountry: 'US',
};

export const BUYER: { actorId: string; actorRole: UserRole } = {
  actorId: 'user-buyer',
  actorRole: USER_ROLES.BUYER,
};
export const APPROVER: { actorId: string; actorRole: UserRole } = {
  actorId: 'user-exec',
  actorRole: USER_ROLES.EXECUTIVE_DIRECTOR,
};
export const TREASURY: { actorId: string; actorRole: UserRole } = {
  actorId: 'user-treasury',
  actorRole: USER_ROLES.FINANCE_DIRECTOR,
};
export const LOGISTICS: { actorId: string; actorRole: UserRole } = {
  actorId: 'user-logistics',
  actorRole: USER_ROLES.OPERATIONS_DIRECTOR,
};
export const BANK: { actorId: string; actorRole: UserRole } = {
  actorId: 'user-bank',
  actorRole: USER_ROLES.BANK_ADMIN,
};
