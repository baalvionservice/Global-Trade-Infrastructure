
/**
 * @file src/services/api.ts
 * @description This file contains a placeholder API service layer. It simulates
 * fetching data from a backend by returning mock data wrapped in Promises.
 * This abstracts data fetching logic from the UI components and prepares the
 * application for a real backend integration.
 */
import {
  heroCards,
  kpiData,
  tradeVolumeData,
  partnerPerformanceData,
  fxRatesData,
  systemAlerts,
  recentTrades,
  aiInsights,
  type HeroCard,
  type Kpi,
  type TradeVolume,
  type PartnerPerformance,
  type FxRate,
  type SystemAlert,
  type Trade,
  type AiInsight,
} from '@/data';
import { apiClient } from '@/lib/api-client';

// Simulate API latency
const aPI_LATENCY = 500;

export const getHeroCards = (): Promise<HeroCard[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(heroCards), aPI_LATENCY);
  });
};

export const getKpiData = (): Promise<Kpi[]> => {
  return new Promise(async resolve => {
    // Demo dynamic logic: Adjust KPIs based on global sanctions flag
    const compRes = await apiClient.get<any>('/companies/COMP-102');
    const isRestricted = compRes.data?.blacklistFlag;
    
    if (isRestricted) {
      const alertedKpi = kpiData.map(k => 
        k.title === 'Active Incidents' ? { ...k, value: '4', change: '+1', iconClass: 'text-red-600 animate-pulse' } : k
      );
      setTimeout(() => resolve(alertedKpi), aPI_LATENCY);
    } else {
      setTimeout(() => resolve(kpiData), aPI_LATENCY);
    }
  });
};

export const getTradeVolumeData = (): Promise<TradeVolume[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(tradeVolumeData), aPI_LATENCY);
  });
};

export const getPartnerPerformanceData = (): Promise<PartnerPerformance[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(partnerPerformanceData), aPI_LATENCY);
  });
};

export const getFxRatesData = (): Promise<FxRate[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(fxRatesData), aPI_LATENCY);
  });
};

export const getSystemAlerts = (): Promise<SystemAlert[]> => {
  return new Promise(async resolve => {
    const compRes = await apiClient.get<any>('/companies/COMP-102');
    const isRestricted = compRes.data?.blacklistFlag;
    
    if (isRestricted) {
      const injectedAlerts: SystemAlert[] = [
        {
          id: 999,
          type: 'Critical',
          title: 'SANCTIONS HIT: COMP-102',
          description: 'GPS Global flagged on OFAC Tier 2 list.',
          time: 'Just now',
          timestamp: new Date().toISOString(),
          details: 'Automated screening detected a high-probability match for "GPS Global" in the updated sanctions registry. Operational accounts restricted.'
        },
        ...systemAlerts
      ];
      setTimeout(() => resolve(injectedAlerts), aPI_LATENCY);
    } else {
      setTimeout(() => resolve(systemAlerts), aPI_LATENCY);
    }
  });
};

export const getRecentTrades = (): Promise<Trade[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(recentTrades), aPI_LATENCY);
  });
};

export const getAiInsights = (): Promise<AiInsight[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(aiInsights), aPI_LATENCY);
  });
};
