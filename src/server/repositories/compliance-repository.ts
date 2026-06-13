/**
 * @file server/repositories/compliance-repository.ts
 * @description Append-only persistence for risk assessments and compliance
 * checks (Agent 7).
 */
import { RiskAssessment, ComplianceCheck } from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

export class RiskAssessmentRepository extends BaseRepository<RiskAssessment> {
  protected readonly entityName = 'RiskAssessment';
  protected readonly softDeletes = false;
  protected delegate(tx?: PrismaTransaction): ModelDelegate<RiskAssessment> {
    return client(tx).riskAssessment as unknown as ModelDelegate<RiskAssessment>;
  }
  async listByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<RiskAssessment[]> {
    return client(tx).riskAssessment.findMany({ where: { tradeTransactionId }, orderBy: { createdAt: 'desc' } });
  }
}

export class ComplianceCheckRepository extends BaseRepository<ComplianceCheck> {
  protected readonly entityName = 'ComplianceCheck';
  protected readonly softDeletes = false;
  protected delegate(tx?: PrismaTransaction): ModelDelegate<ComplianceCheck> {
    return client(tx).complianceCheck as unknown as ModelDelegate<ComplianceCheck>;
  }
  async listByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<ComplianceCheck[]> {
    return client(tx).complianceCheck.findMany({ where: { tradeTransactionId }, orderBy: { createdAt: 'desc' } });
  }
}

export const riskAssessmentRepository = new RiskAssessmentRepository();
export const complianceCheckRepository = new ComplianceCheckRepository();
