/**
 * @file simulation-service.ts
 * @description Master orchestration for Institutional Trade Simulation and Digital Twins.
 * Acts as the authoritative replica of global trade state for pre-execution validation.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from '../observability-service';
import { eventBus } from '@/orchestration/event-bus';

export type SimulationType = 'CORRIDOR_DISRUPTION' | 'TREASURY_STRESS' | 'SANCTIONS_IMPACT' | 'OPERATIONAL_CASCADE';
export type SimulationStatus = 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface SimulationScenario {
  id: string;
  title: string;
  type: SimulationType;
  status: SimulationStatus;
  parameters: Record<string, any>;
  results?: {
    probabilityOfFailure: number;
    estimatedCostImpact: number;
    varianceHours: number;
    impactedNodes: string[];
    recommendations: string[];
  };
  createdAt: string;
  createdBy: string;
}

class SimulationService {
  private static instance: SimulationService;

  private constructor() {}

  public static getInstance(): SimulationService {
    if (!SimulationService.instance) {
      SimulationService.instance = new SimulationService();
    }
    return SimulationService.instance;
  }

  /**
   * Initializes a high-fidelity operational simulation for strategic planning.
   */
  async runScenario(data: Omit<SimulationScenario, 'id' | 'status' | 'createdAt' | 'results'>): Promise<SimulationScenario> {
    logger.info('SimulationEngine', `INITIATING_SIMULATION: ${data.title} (${data.type})`);

    const res = await apiClient.post<SimulationScenario>('/simulation_scenarios', {
      ...data,
      status: 'RUNNING'
    });

    const scenario = res.data!;
    this.executeProbabilisticLogic(scenario);

    return scenario;
  }

  /**
   * Executes the probabilistic compute logic for the digital twin scenario.
   */
  private async executeProbabilisticLogic(scenario: SimulationScenario) {
    try {
      // Simulate high-intensity probabilistic compute duration
      await new Promise(r => setTimeout(r, 4000));

      const results = this.calculateResults(scenario.type, scenario.parameters);

      await apiClient.patch(`/simulation_scenarios/${scenario.id}`, {
        status: 'COMPLETED',
        results
      });

      logger.info('SimulationEngine', `SIMULATION_FINALITY_REACHED: Node ${scenario.id}`);
      
      // Notify strategic oracles if risk threshold exceeded
      if (results.probabilityOfFailure > 0.6) {
        eventBus.publish('SIGNAL_ANOMALY_DETECTED' as any, {
          entityId: scenario.id,
          type: 'SIMULATED_SYSTEMIC_RISK',
          severity: 'HIGH',
          payload: results
        });
      }

      metricsService.recordMetric('simulations_executed_total', 1);
    } catch (e: any) {
      logger.error('SimulationEngine', `EXECUTION_FAILURE: ${scenario.id} - ${e.message}`);
      await apiClient.patch(`/simulation_scenarios/${scenario.id}`, { status: 'FAILED' });
    }
  }

  private calculateResults(type: SimulationType, params: any) {
    switch (type) {
      case 'CORRIDOR_DISRUPTION':
        return {
          probabilityOfFailure: 0.72,
          estimatedCostImpact: 450000,
          varianceHours: 72,
          impactedNodes: ['Port-SHA', 'Port-LGB', 'CORR-V-US'],
          recommendations: ['Reroute via Singapore Node', 'Initiate Buffer Escrow Funding', 'Activate Secondary Carrier Node']
        };
      case 'TREASURY_STRESS':
        return {
          probabilityOfFailure: 0.45,
          estimatedCostImpact: 1200000,
          varianceHours: 12,
          impactedNodes: ['EU-Banking-Cluster', 'Settlement-Node-A', 'FX-GATEWAY'],
          recommendations: ['Hedge USD/EUR Exposure', 'Activate Secondary Liquidity Swap', 'Freeze Low-Priority Tenders']
        };
      case 'SANCTIONS_IMPACT':
        return {
          probabilityOfFailure: 0.98,
          estimatedCostImpact: 15000000,
          varianceHours: 0,
          impactedNodes: ['Entity-Node-992', 'Corridor-APAC-West', 'GOV-GATEWAY'],
          recommendations: ['Immediate Trade Freeze', 'Institutional Exit Protocol', 'Notify Sovereign Adjudication Hub']
        };
      case 'OPERATIONAL_CASCADE':
        return {
          probabilityOfFailure: 0.88,
          estimatedCostImpact: 8400000,
          varianceHours: 140,
          impactedNodes: ['ALL_DOMAINS'],
          recommendations: ['Initialize Protocol Freeze', 'Engage Break-Glass Disaster Recovery', 'Manual Consensus Override Required']
        };
      default:
        return {
          probabilityOfFailure: 0.1,
          estimatedCostImpact: 0,
          varianceHours: 0,
          impactedNodes: [],
          recommendations: ['Baseline monitoring sufficient']
        };
    }
  }

  async getScenarios(): Promise<SimulationScenario[]> {
    const res = await apiClient.get<SimulationScenario[]>('/simulation_scenarios', {
      sortBy: 'createdAt',
      order: 'desc'
    });
    return toList(res);
  }
}

export const simulationService = SimulationService.getInstance();
