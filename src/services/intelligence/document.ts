/**
 * @file src/services/intelligence/document.ts
 * @description AI-assisted document parsing, discrepancy detection, and knowledge extraction.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from '../observability-service';

export interface DocumentAnomaly {
  id: string;
  field: string;
  expectedValue: string;
  extractedValue: string;
  confidence: number;
  severity: 'warning' | 'error';
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  isMatched: boolean;
}

export const documentIntelligence = {
  /**
   * Simulates AI parsing of a trade document and checks for ledger discrepancies.
   * Compares extracted values against ground-truth data in the platform.
   */
  async auditDocument(docId: string): Promise<DocumentAnomaly[]> {
    logger.info('DocIntelligence', `INITIATING_FORENSIC_AUDIT: ${docId}`);
    
    const docRes = await apiClient.get<any>(`/trade_documents/${docId}`);
    const doc = docRes.data;

    if (!doc) return [];

    const anomalies: DocumentAnomaly[] = [];

    // MOCK: Discrepancy Detection Logic simulating a check against an Order (ORD-9921)
    if (doc.type === 'commercial_invoice' && doc.referenceId === 'ORD-9921') {
      anomalies.push({
        id: 'ANOM-1',
        field: 'Total Value',
        expectedValue: '$350,000',
        extractedValue: '$35,000',
        confidence: 0.99,
        severity: 'error'
      });
    }

    if (doc.type === 'bill_of_lading') {
      anomalies.push({
        id: 'ANOM-2',
        field: 'Consignee Identity',
        expectedValue: 'Beacon Tech Solutions',
        extractedValue: 'Beacon Tech US-Branch',
        confidence: 0.88,
        severity: 'warning'
      });
    }

    return anomalies;
  },

  /**
   * Returns a map of extracted fields for UI visualization.
   */
  async getExtractedData(docId: string): Promise<ExtractedField[]> {
    return [
      { label: 'Document Number', value: 'INV-441-2024', confidence: 0.99, isMatched: true },
      { label: 'Issue Date', value: '2024-05-12', confidence: 0.95, isMatched: true },
      { label: 'Exporter Name', value: 'Global Power Systems', confidence: 0.98, isMatched: true },
      { label: 'Settlement Terms', value: 'Net-30', confidence: 0.92, isMatched: true },
      { label: 'Line Item Count', value: '4', confidence: 0.99, isMatched: true }
    ];
  }
};
