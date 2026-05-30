/**
 * @file src/services/logistics/adapters/base-adapter.ts
 * @description Abstract base for logistics adapters providing common observability.
 */
import { logger } from '../../observability-service';

export abstract class BaseLogisticsAdapter {
  protected providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  protected async logOutboundRequest(action: string, payload: any) {
    logger.info('LogisticsAdapter', `OUTBOUND_REQUEST: ${this.providerName} - ${action}`, { payload });
  }

  protected async logInboundCallback(action: string, response: any) {
    logger.info('LogisticsAdapter', `INBOUND_CALLBACK: ${this.providerName} - ${action}`, { response });
  }

  protected handleError(action: string, error: any): never {
    logger.error('LogisticsAdapter', `ADAPTER_FAILURE: ${this.providerName} - ${action} - ${error.message}`);
    throw new Error(`Carrier ${this.providerName} Gateway Error: ${error.message}`);
  }
}
