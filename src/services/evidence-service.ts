
/**
 * @file evidence-service.ts
 * @description Forensic management system for legal evidence and chain-of-custody tracking.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger } from './observability-service';
import { EvidenceRecord } from '@/types/institutional';

export const evidenceService = {
  /**
   * Submits a piece of evidence to a dispute case with forensic metadata.
   */
  async submitEvidence(data: {
    caseId: string;
    type: EvidenceRecord['type'];
    title: string;
    fileUrl?: string;
    metadata: any;
    submittedBy: string;
  }): Promise<EvidenceRecord> {
    logger.info('EvidenceService', `SUBMITTING_EVIDENCE: Case ${data.caseId} Type ${data.type}`);

    const res = await apiClient.post<EvidenceRecord>('/evidence_records', {
      ...data,
      isVerified: false,
      createdAt: new Date().toISOString()
    });

    return res.data!;
  },

  /**
   * Retrieves the full evidence dossier for a specific case.
   */
  async getEvidenceForCase(caseId: string): Promise<EvidenceRecord[]> {
    const res = await apiClient.get<EvidenceRecord[]>('/evidence_records', { caseId });
    return toList(res);
  },

  /**
   * Verifies the authenticity of a submitted evidence record.
   */
  async verifyEvidence(evidenceId: string, verifierId: string) {
    return apiClient.patch(`/evidence_records/${evidenceId}`, {
      isVerified: true,
      verifiedBy: verifierId,
      verifiedAt: new Date().toISOString()
    });
  }
};
