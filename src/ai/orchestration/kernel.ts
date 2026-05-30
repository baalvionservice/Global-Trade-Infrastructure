/**
 * @file kernel.ts
 * @description THE SUPREME AI COGNITION KERNEL.
 * Orchestrates multi-agent reasoning using hierarchical LangGraph models.
 */
import { logger, metricsService } from "@/services/observability-service";
import { AgentRegistry } from "../agents/registry";
import { TrustGuard } from "../governance/trust-guard";
import { VectorMemory } from "../memory/vector-store";
import { AIState, CognitiveContext, ReasoningStep, AgentStatus } from "./types";
import { eventBus } from "@/orchestration/event-bus";

class AICognitionKernel {
  private static instance: AICognitionKernel;

  private constructor() {
    this.initializeEventLink();
  }

  public static getInstance(): AICognitionKernel {
    if (!AICognitionKernel.instance) {
      AICognitionKernel.instance = new AICognitionKernel();
    }
    return AICognitionKernel.instance;
  }

  private initializeEventLink() {
    // Synchronize Brain with the Global Event Mesh
    eventBus.subscribe('SIGNAL_ANOMALY_DETECTED', async (event) => {
       const context: CognitiveContext = {
         userId: 'SYSTEM_SENTINEL',
         tenantId: 'GLOBAL',
         jurisdiction: 'SOVEREIGN_CORE',
         permissions: ['READ_ALL', 'EXECUTE_OPTIMIZATION'],
         missionId: `ANOMALY-${event.id}`
       };
       await this.executeMission(`MISSION-${event.id}`, context);
    });
  }

  /**
   * Executes a high-authority Strategic Mission.
   * Flow: Triage -> Collaborative Reasoning -> Governance Guard -> Semantic Commitment
   */
  async executeMission(missionId: string, context: CognitiveContext): Promise<AIState> {
    logger.info('AI_Kernel', `INITIATING_MISSION: ${missionId}`, { tenantId: context.tenantId });

    let state: AIState = {
      missionId,
      context,
      reasoningTrace: [],
      proposedActions: [],
      confidenceScore: 0,
      activeAgent: 'COORDINATOR_PRIME',
      status: 'THINKING'
    };

    try {
      // 1. Triage Phase (Coordinator Prime)
      state = await this.step(state, 'COORDINATOR_PRIME');

      // 2. Multi-Agent Reasoning Handshake
      const domains: any[] = ['COMPLIANCE', 'FINANCE', 'OPERATIONS'];
      for (const domain of domains) {
        const agents = AgentRegistry.getAgentsByDomain(domain);
        if (agents.length > 0) {
          state = await this.step(state, agents[0].id);
        }
      }

      // 3. Trust-Guard Validation (The Logic Perimeter)
      const validation = await TrustGuard.validateProposedActions(state.proposedActions);
      state.confidenceScore = validation.score;
      state.status = validation.isAuthorized ? 'EXECUTING' : 'ESCALATED';

      if (validation.violations.length > 0) {
        state.reasoningTrace.push({
          agentId: 'GOVERNANCE_ORACLE',
          thought: `Governance conflict detected: ${validation.violations.join('; ')}`,
          confidence: 1.0,
          timestamp: new Date().toISOString()
        });
      }

      // 4. Semantic Commitment (Indexing the Reasoning Trace)
      await VectorMemory.indexMissionArtifacts(missionId, state.reasoningTrace, state.status);
      
      metricsService.recordMetric('ai_mission_finality_total', 1);
      
      // 5. Emit Decision Signal
      await eventBus.publish({
        id: `AI-DEC-${missionId}`,
        type: 'AI_MISSION_FINALIZED',
        severity: state.status === 'ESCALATED' ? 'WARNING' : 'INFO',
        payload: { missionId, status: state.status, actions: state.proposedActions },
        source: 'AI_KERNEL',
        timestamp: new Date().toISOString(),
        correlationId: missionId
      });

      logger.info('AI_Kernel', `MISSION_FINALIZED: ${missionId} - Status: ${state.status}`);

      return state;
    } catch (e: any) {
      logger.error('AI_Kernel', `MISSION_CRITICAL_FAILURE: ${e.message}`);
      throw e;
    }
  }

  /**
   * Executes a single reasoning step for a specific agent node.
   */
  private async step(state: AIState, agentId: string): Promise<AIState> {
    const agent = AgentRegistry.getAgent(agentId);
    logger.info('AI_Kernel', `AGENT_TURN: ${agent.name} [${agent.role}]`);

    const result = await agent.execute(state.context);
    
    const step: ReasoningStep = {
      agentId,
      thought: result.log,
      timestamp: new Date().toISOString(),
      confidence: 0.98,
      action: result.actions.length > 0 ? result.actions[0] : undefined
    };

    return {
      ...state,
      reasoningTrace: [...state.reasoningTrace, step],
      proposedActions: [...state.proposedActions, ...result.actions],
      activeAgent: agentId
    };
  }
}

export const aiKernel = AICognitionKernel.getInstance();
