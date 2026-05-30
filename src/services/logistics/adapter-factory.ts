/**
 * @file src/services/logistics/adapter-factory.ts
 * @description Factory for resolving carrier-specific adapters.
 */
import { ILogisticsAdapter } from './types';
import { MaerskAdapter } from './adapters/maersk-adapter';

class LogisticsAdapterFactory {
  private static instance: LogisticsAdapterFactory;
  private adapters: Map<string, ILogisticsAdapter> = new Map();

  private constructor() {
    // Register default institutional adapters
    this.registerAdapter(new MaerskAdapter() as any);
  }

  public static getInstance(): LogisticsAdapterFactory {
    if (!LogisticsAdapterFactory.instance) {
      LogisticsAdapterFactory.instance = new LogisticsAdapterFactory();
    }
    return LogisticsAdapterFactory.instance;
  }

  registerAdapter(adapter: ILogisticsAdapter) {
    this.adapters.set(adapter.providerId, adapter);
  }

  /**
   * Resolves the adapter based on carrier ID or returns a default simulation adapter.
   */
  getAdapter(carrierId: string): ILogisticsAdapter {
    const adapter = this.adapters.get(carrierId);
    if (!adapter) {
      // Fallback to default Maersk node for demo consistency
      return Array.from(this.adapters.values())[0];
    }
    return adapter;
  }
}

export const logisticsAdapterFactory = LogisticsAdapterFactory.getInstance();
