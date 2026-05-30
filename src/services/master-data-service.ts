/**
 * @file master-data-service.ts
 * @description Authoritative service for Institutional Master Data and Operational Registries.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export interface PortMaster {
  id: string;
  name: string;
  country: string;
  code: string;
  region: string;
  type: 'Sea' | 'Air' | 'Land';
}

export interface IncotermMaster {
  id: string;
  code: string;
  name: string;
  responsibility: string;
  riskTransfer: string;
}

export interface CountryIntel {
  id: string;
  country: string;
  complianceScore: number;
  restrictions: string[];
  mandatoryDocs: string[];
  complexityIndex: 'Low' | 'Medium' | 'High';
}

export const masterDataService = {
  /**
   * Retrieves all verified ports for logistics routing.
   */
  async getPorts(): Promise<PortMaster[]> {
    const res = await apiClient.get<PortMaster[]>('/ports');
    return toList(res);
  },

  /**
   * Retrieves standardized Incoterms definitions.
   */
  async getIncoterms(): Promise<IncotermMaster[]> {
    const res = await apiClient.get<IncotermMaster[]>('/incoterms');
    return toList(res);
  },

  /**
   * Retrieves sovereign intelligence for specific jurisdictions.
   */
  async getCountryIntelligence(): Promise<CountryIntel[]> {
    const res = await apiClient.get<CountryIntel[]>('/country_intel', { sortBy: 'country', order: 'asc' });
    return res.data || [
      {
        id: 'CI-1',
        country: 'United States',
        complianceScore: 98,
        restrictions: ['High-tech semiconductors', 'Defense articles'],
        mandatoryDocs: ['Commercial Invoice', 'Packing List'],
        complexityIndex: 'Low'
      },
      {
        id: 'CI-2',
        country: 'China',
        complianceScore: 92,
        restrictions: ['Renewable energy components'],
        mandatoryDocs: ['Certificate of Origin', 'CCC Certification'],
        complexityIndex: 'Medium'
      }
    ];
  },

  /**
   * Performs an operational discovery across all master entities.
   */
  async globalRegistrySearch(term: string) {
    const [ports, orgs, codes] = await Promise.all([
      apiClient.get<any[]>('/ports', { search: term }),
      apiClient.get<any[]>('/organizations', { search: term }),
      apiClient.get<any[]>('/hs_codes', { search: term })
    ]);

    return {
      ports: ports.data || [],
      organizations: orgs.data || [],
      hsCodes: codes.data || []
    };
  }
};
