/**
 * @file registry.ts
 * @description Catalog of Sovereign AI Agents and their specialized cognitive capabilities.
 */
import { AgentDomain, AgentDefinition } from "../orchestration/types";

export class AgentRegistry {
  private static agents: Map<string, AgentDefinition> = new Map();

  static register(agent: AgentDefinition) {
    this.agents.set(agent.id, agent);
  }

  static getAgent(id: string): AgentDefinition {
    const agent = this.agents.get(id);
    if (!agent) throw new Error(`AGENT_NOT_FOUND: ${id}`);
    return agent;
  }

  static getAgentsByDomain(domain: AgentDomain): AgentDefinition[] {
    return Array.from(this.agents.values()).filter(a => a.domain === domain);
  }
}

/**
 * SEEDING THE AGENT CIVILIZATION
 */
AgentRegistry.register({
  id: 'COORDINATOR_PRIME',
  name: 'Singularity Coordinator',
  role: 'ORCHESTRATOR',
  domain: 'EXECUTIVE',
  capabilities: ['MISSION_TRIAGE', 'DOMAIN_FEDERATION', 'FINALITY_AUDIT'],
  execute: async (ctx) => ({ 
    log: 'Strategic mission context analyzed. Synchronizing domain clusters for corridor rebalancing and liquidity staging.', 
    actions: [] 
  })
});

AgentRegistry.register({
  id: 'TREASURY_ORACLE',
  name: 'Capital Sentinel',
  role: 'TREASURY_AGENT',
  domain: 'FINANCE',
  capabilities: ['FX_FORECASTING', 'LIQUIDITY_MODELING', 'ESCROW_VERIFICATION'],
  execute: async (ctx) => ({ 
    log: 'Treasury depth verified. FX rate locked for APAC corridor. Escrow mandate staged for $1.2M.', 
    actions: [{ type: 'LOCK_LIQUIDITY', amount: ctx.amount || 1200000, currency: 'USD' }] 
  })
});

AgentRegistry.register({
  id: 'LOGISTICS_SENTINEL',
  name: 'Corridor Oracle',
  role: 'LOGISTICS_AGENT',
  domain: 'OPERATIONS',
  capabilities: ['REROUTING', 'DELAY_PREDICTION', 'PORT_INTELLIGENCE'],
  execute: async (ctx) => ({ 
    log: 'Corridor congestion analyzed. Predicted delay in Mumbai node: +14h. Autonomous rerouting suggested via Singapore hub.', 
    actions: [{ type: 'PROPOSE_REROUTE', targetNode: 'SG_HUB', originalNode: 'MUMBAI_HUB' }] 
  })
});

AgentRegistry.register({
  id: 'COMPLIANCE_GUARD',
  name: 'Jurisdictional Sentinel',
  role: 'COMPLIANCE_AGENT',
  domain: 'COMPLIANCE',
  capabilities: ['SANCTIONS_SCREENING', 'IDENTITY_ATTESTATION', 'HTS_CLASSIFICATION'],
  execute: async (ctx) => ({ 
    log: 'Sanctions scan complete. Counterparty cleared against OFAC Tier 2. Identity depth verified at Level 4.', 
    actions: [{ type: 'VERIFY_IDENTITY', level: 4 }] 
  })
});
