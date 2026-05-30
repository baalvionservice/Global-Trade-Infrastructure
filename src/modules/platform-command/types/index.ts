
/**
 * @file src/modules/platform-command/types/index.ts
 * @description Master contracts for the Universal Search and Command Palette.
 */

export type SearchResultCategory = 
  | 'SOURCING' 
  | 'NEGOTIATION' 
  | 'EXECUTION' 
  | 'FINANCIAL' 
  | 'COMPLIANCE' 
  | 'IDENTITY' 
  | 'INTELLIGENCE'
  | 'GOVERNANCE';

export interface GlobalSearchResult {
  id: string;
  type: string;
  category: SearchResultCategory;
  title: string;
  subtitle: string;
  status?: string;
  path: string;
  metadata?: Record<string, any>;
  relevance: number;
}

export interface CommandAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category: 'workflow' | 'navigation' | 'governance' | 'system';
}

export interface OperationalAlert {
  id: string;
  category: 'SHIPMENT' | 'TREASURY' | 'SECURITY' | 'COMPLIANCE';
  severity: 'critical' | 'high' | 'medium' | 'info';
  message: string;
  entityId: string;
  timestamp: string;
  isAcknowledged: boolean;
}
