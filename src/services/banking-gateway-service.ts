
/**
 * @file banking-gateway-service.ts
 * @description Orchestrates the secure handshake between Baalvion and external Institutional Banking APIs.
 */
import { encryptionService } from './encryption-service';
import { logger, metricsService } from './observability-service';
import { recordTransaction } from './ledger-service';
import { apiClient } from '@/lib/api-client';

export interface BankingSettlementRequest {
  id: string;
  externalBankId: string;
  amount: number;
  currency: string;
  destinationAccount: string;
  referenceId: string;
  status: 'pending' | 'signed' | 'dispatched' | 'confirmed' | 'failed';
  idempotencyKey: string;
}

class BankingGatewayService {
  private static instance: BankingGatewayService;

  private constructor() {}

  public static getInstance(): BankingGatewayService {
    if (!BankingGatewayService.instance) {
      BankingGatewayService.instance = new BankingGatewayService();
    }
    return BankingGatewayService.instance;
  }

  /**
   * Primary entry point for an external bank settlement.
   * Follows the "Signed Handshake" protocol.
   */
  async initiateExternalSettlement(data: {
    amount: number;
    currency: string;
    destination: string;
    referenceId: string;
    institutionKey: string;
  }): Promise<BankingSettlementRequest> {
    logger.info('BankingGateway', `INITIATING_SECURE_SETTLEMENT: Ref ${data.referenceId}`);

    const idempotencyKey = `IDEM_${data.referenceId}_${Date.now()}`;
    const res = await apiClient.post<BankingSettlementRequest>('/banking_settlements', {
      ...data,
      idempotencyKey,
      status: 'pending'
    });
    const settlement = res.data!;

    try {
      // Cryptographic Signing
      const payload = {
        amount: data.amount,
        currency: data.currency,
        destination: data.destination,
        ref: data.referenceId,
        timestamp: new Date().toISOString()
      };
      
      const signedPacket = encryptionService.signPayload(payload, data.institutionKey);
      await apiClient.patch(`/banking_settlements/${settlement.id}`, { status: 'signed' });

      // Dispatch Simulation
      logger.info('BankingGateway', `DISPATCHING_SIGNED_PAYLOAD: Node ${settlement.id}`);
      
      const updated = await apiClient.patch<BankingSettlementRequest>(`/banking_settlements/${settlement.id}`, {
        status: 'dispatched'
      });

      metricsService.recordMetric('external_banking_dispatched', 1);
      
      // Simulate async confirmation from bank
      setTimeout(() => this.finalizeSettlement(settlement.id), 3000);

      return updated.data!;

    } catch (e: any) {
      logger.error('BankingGateway', `SETTLEMENT_CRITICAL_FAILURE: ${settlement.id} - ${e.message}`);
      await apiClient.patch(`/banking_settlements/${settlement.id}`, { status: 'failed' });
      throw e;
    }
  }

  async finalizeSettlement(settlementId: string) {
    const settlementRes = await apiClient.getDoc<BankingSettlementRequest>('banking_settlements', settlementId);
    const settlement = settlementRes.data;

    if (settlement && settlement.status !== 'confirmed') {
      await recordTransaction({
        companyId: 'SYSTEM_TREASURY',
        type: 'credit',
        amount: settlement.amount,
        currency: settlement.currency,
        referenceType: 'deposit',
        referenceId: settlement.referenceId,
        description: `External Finality: Bank Settlement Confirmed for ${settlement.referenceId}`
      });

      await apiClient.patch(`/banking_settlements/${settlementId}`, { status: 'confirmed' });
      logger.info('BankingGateway', `SETTLEMENT_FINALIZED: Ref ${settlementId} is now SECURE.`);
    }
  }
}

export const bankingGatewayService = BankingGatewayService.getInstance();
