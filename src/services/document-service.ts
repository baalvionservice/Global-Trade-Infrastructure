/**
 * @file src/services/document-service.ts
 * @description The authoritative service for the Baalvion Sovereign Digital Vault.
 * Orchestrates document lifecycles, version governance, and AI-assisted extraction.
 */
import { apiClient } from '@/lib/api-client';
import { eventBus } from './event-bus';
import { logger, metricsService } from './observability-service';
import { requireSessionOrgId } from './session-org';

export type DocumentType = 
  | 'commercial_invoice' 
  | 'bill_of_lading' 
  | 'packing_list' 
  | 'certificate_of_origin' 
  | 'insurance_certificate'
  | 'bis_certificate'
  | 'sales_contract'
  | 'tax_document'
  | 'customs_declaration'
  | 'regulatory_permit';

export type DocumentClassification = 'CONFIDENTIAL' | 'RESTRICTED' | 'OPERATIONAL' | 'GOVERNANCE';
export type DocumentStatus = 'vaulted' | 'extracting' | 'audited' | 'verified' | 'rejected' | 'archived';

export interface TradeDocument {
  id: string;
  referenceType: 'shipment' | 'order' | 'company' | 'general' | 'incident';
  referenceId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  version: number;
  status: DocumentStatus;
  classification: DocumentClassification;
  uploadedBy: string;
  companyId: string;
  rejectionReason?: string;
  fingerprint: string;
  metadata?: {
    extractionConfidence?: number;
    vaultNode?: string;
    retentionPolicy?: string;
    signatories?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * The trade-service Document model is flat snake_case. Map it onto the UI's
 * TradeDocument vault shape. Backend 'draft' surfaces as 'vaulted'.
 */
function mapDocFromApi(raw: any): TradeDocument {
  const statusMap: Record<string, DocumentStatus> = {
    draft: 'vaulted', issued: 'vaulted', vaulted: 'vaulted', extracting: 'extracting',
    audited: 'audited', verified: 'verified', rejected: 'rejected',
    expired: 'archived', archived: 'archived',
  };
  return {
    id: String(raw?.id),
    referenceType: (raw?.entity_type || 'general') as TradeDocument['referenceType'],
    referenceId: String(raw?.entity_id ?? ''),
    type: (raw?.doc_type || 'other') as DocumentType,
    fileName: raw?.title || 'Untitled Document',
    fileUrl: raw?.file_url || '',
    version: Number(raw?.version) || 1,
    status: statusMap[raw?.status] || 'vaulted',
    classification: (raw?.classification || 'OPERATIONAL') as DocumentClassification,
    uploadedBy: raw?.uploaded_by || 'System',
    companyId: String(raw?.company_id ?? ''),
    fingerprint: raw?.file_hash || '',
    metadata: raw?.metadata || {},
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
  } as TradeDocument;
}

class DocumentService {
  private static instance: DocumentService;

  private constructor() {}

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  /**
   * Authorizes and vaults a trade document with cryptographic versioning.
   */
  async vaultDocument(data: {
    referenceType: TradeDocument['referenceType'];
    referenceId: string;
    type: DocumentType;
    fileName: string;
    uploadedBy: string;
    classification?: DocumentClassification;
    companyId?: string;
  }): Promise<TradeDocument> {
    // Vault ownership must be the authenticated org, not a fixed demo tenant.
    const companyId = data.companyId || (await requireSessionOrgId());
    logger.info('DocumentVault', `INITIATING_VAULT_PROTOCOL: ${data.fileName}`);

    // 1. Resolve lineage version (count existing docs of this type for the entity).
    const existingRes = await apiClient.get<any>('/documents', {
      entity_id: data.referenceId,
      doc_type: data.type,
    });
    const newVersion = (existingRes.data?.total ?? existingRes.data?.items?.length ?? 0) + 1;

    // 2. Commit to the trade-service document registry (snake_case).
    const res = await apiClient.post<any>('/documents', {
      entity_type: data.referenceType,
      entity_id: data.referenceId,
      doc_type: data.type,
      title: data.fileName,
      file_url: `https://vault.baalvion.gov/files/${companyId}/${data.referenceId}/${data.fileName}`,
      // file_hash (cryptographic fingerprint) is computed by the vault backend
      // on the stored bytes. A client-side hash would be a fake integrity proof.
      status: 'vaulted',
      classification: data.classification || 'OPERATIONAL',
      version: newVersion,
      company_id: companyId,
      uploaded_by: data.uploadedBy,
      metadata: {},
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to vault document.');
    }

    const doc = mapDocFromApi(res.data);
    this.dispatchToExtractionOracle(doc.id);

    await eventBus.publish('DOCUMENT_UPLOADED' as any, doc);
    metricsService.recordMetric('documents_vaulted_total', 1);

    return doc;
  }

  /**
   * Extraction is not yet backed by a real pipeline; record intent only.
   */
  private async dispatchToExtractionOracle(docId: string) {
    logger.info('DocumentIntelligence', `EXTRACTION_QUEUED: Node ${docId}`);
  }

  /**
   * Formally authorizes a document via the real verify/reject lifecycle endpoints.
   */
  async authorizeDocument(id: string, action: 'verified' | 'rejected', _reason?: string): Promise<TradeDocument> {
    logger.warn('DocumentGovernance', `GOVERNANCE_SIGN_OFF: ${id} set to ${action}`);

    const endpoint = action === 'verified' ? 'verify' : 'reject';
    const res = await apiClient.patch<any>(`/documents/${id}/${endpoint}`, {});
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to authorize document.');
    }

    const doc = mapDocFromApi(res.data);
    if (action === 'verified') {
      eventBus.publish('DOCUMENT_VERIFIED' as any, {
        documentId: doc.id,
        referenceId: doc.referenceId,
        type: doc.type,
      });
    }

    return doc;
  }

  /**
   * Retrieves the full auditable dossier for an operational entity.
   */
  async getDossier(referenceId: string): Promise<TradeDocument[]> {
    const res = await apiClient.get<any>('/documents', { entity_id: referenceId });
    return (res.data?.items ?? []).map(mapDocFromApi);
  }

  /**
   * Searches the institutional vault using metadata-driven filters.
   */
  async queryVault(params: any): Promise<TradeDocument[]> {
    const res = await apiClient.get<any>('/documents', {
      company_id: params.companyId,
      entity_id: params.referenceId,
      doc_type: params.type,
    });
    return (res.data?.items ?? []).map(mapDocFromApi);
  }
}

export const documentService = DocumentService.getInstance();

// Legacy Wrapper Exports
export const getDocuments = (refId: string) => documentService.getDossier(refId);
export const uploadDocument = (data: any) => documentService.vaultDocument(data);
export const verifyDocument = (id: string, action: any) => documentService.authorizeDocument(id, action);
export const getInstitutionalVault = (companyId: string) => documentService.queryVault({ companyId });
