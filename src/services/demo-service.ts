/**
 * @file demo-service.ts
 * @description Orchestrates the platform's real-time demonstration mode and scenario injection.
 * Simulates active trade activity, logistics updates, and system logs.
 */
import { eventBus } from './event-bus';
import { logger, metricsService } from './observability-service';
import { apiClient } from '@/lib/api-client';

class DemoService {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Starts a background simulation of trade activity.
   */
  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('DemoService', 'Autonomous Demo Simulation Started.');

    this.interval = setInterval(async () => {
      await this.triggerRandomAction();
    }, 4000); // Trigger an event every 4 seconds
  }

  /**
   * Stops the background simulation.
   */
  stopSimulation() {
    if (this.interval) clearInterval(this.interval);
    this.isRunning = false;
    logger.info('DemoService', 'Autonomous Demo Simulation Stopped.');
  }

  /**
   * Injects a specific disruption scenario into the platform.
   */
  async injectScenario(type: 'dispute' | 'delay' | 'high_risk' | 'none') {
    logger.warn('DemoService', `Injecting Scenario: ${type.toUpperCase()}`);

    switch (type) {
      case 'dispute':
        // 1. Mutate Escrow to Disputed
        await apiClient.patch('/escrows/ESC-5002', { 
          status: 'disputed', 
          updatedAt: new Date().toISOString() 
        });
        // 2. Trigger Admin Alert
        eventBus.publish('COMPLIANCE_FAILED' as any, { 
          referenceId: 'ESC-5002', 
          reason: 'MANUAL_DISPUTE_RAISED',
          description: 'Institutional Buyer has challenged the pre-shipment verification for Order ORD-3002.'
        });
        break;

      case 'delay':
        // 1. Mutate Shipment to Flagged
        await apiClient.patch('/shipments/SHP-4421', { 
          status: 'customs_clearance',
          updatedAt: new Date().toISOString() 
        });
        // 2. Publish Delay Signal
        logger.error('LogisticsEngine', 'CORRIDOR_ALERT: Port congestion in Mumbai resulting in 72h+ clearance delay.');
        metricsService.recordMetric('corridor_delay_hours', 72);
        break;

      case 'high_risk':
        // 1. Mutate Company Profile (GPS Global COMP-102)
        await apiClient.patch('/companies/COMP-102', { 
          trustScore: 32,
          riskLevel: 'high',
          sanctionsFlag: true,
          blacklistFlag: true
        });
        // 2. Trigger Sanctions Alert
        eventBus.publish('COMPLIANCE_FAILED' as any, { 
          referenceId: 'COMP-102', 
          reason: 'SANCTIONS_LIST_MATCH',
          description: 'Entity matches global sanctions list (OFAC Match: Tier 2).'
        });
        break;

      case 'none':
        // Restore COMP-102 to normal
        await apiClient.patch('/companies/COMP-102', { 
          trustScore: 92,
          riskLevel: 'medium',
          sanctionsFlag: false,
          blacklistFlag: false
        });
        // Restore ESC-5002
        await apiClient.patch('/escrows/ESC-5002', { status: 'created' });
        logger.info('DemoService', 'System restored to baseline institutional state.');
        break;
    }
  }

  private async triggerRandomAction() {
    const actions = [
      this.simulateLogisticsUpdate,
      this.simulateNewRfq,
      this.simulateSystemLog,
      this.simulateMarketInsight
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    await randomAction.call(this);
  }

  private async simulateLogisticsUpdate() {
    const shipmentsRes = await apiClient.get<any[]>('/shipments', { status: 'in_transit' });
    const shipment = shipmentsRes.data?.[0];

    if (shipment) {
      logger.info('DemoEngine', `Simulating telemetry update for ${shipment.id}`);
      eventBus.publish('SHIPMENT_UPDATED' as any, { ...shipment, updatedAt: new Date().toISOString() });
    }
  }

  private async simulateNewRfq() {
    const categories = ['Electronics', 'Machinery', 'Textiles', 'Energy'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    
    logger.info('DemoEngine', `Simulating marketplace signal: New ${cat} sourcing request detected.`);
    eventBus.publish('RFQ_CREATED' as any, { 
      productName: `Simulated ${cat} Batch`,
      category: cat,
      targetPrice: Math.floor(Math.random() * 50000)
    });
  }

  private async simulateSystemLog() {
    const services = ['AuthGateway', 'LedgerNode', 'ComplianceOracle', 'EventBus'];
    const service = services[Math.floor(Math.random() * services.length)];
    
    logger.info(service, `Node health check verified. Latency: ${Math.floor(Math.random() * 150)}ms`);
    metricsService.recordMetric('system_node_ping', 1);
  }

  private async simulateMarketInsight() {
    metricsService.recordMetric('trade_velocity_index', Math.random() * 100);
  }

  status() {
    return this.isRunning;
  }
}

export const demoService = new DemoService();
