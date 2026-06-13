/**
 * @file server/repositories/document-repository.ts
 * @description Trade-document repository (Agent 12) with versioning support.
 */
import { Document } from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

export class DocumentRepository extends BaseRepository<Document> {
  protected readonly entityName = 'Document';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Document> {
    return client(tx).document as unknown as ModelDelegate<Document>;
  }

  async listByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<Document[]> {
    return client(tx).document.findMany({
      where: { tradeTransactionId, deletedAt: null },
      orderBy: [{ kind: 'asc' }, { version: 'desc' }],
    });
  }

  async latestVersion(tradeTransactionId: string, kind: string, tx?: PrismaTransaction): Promise<Document | null> {
    return client(tx).document.findFirst({
      where: { tradeTransactionId, kind, deletedAt: null, status: 'active' },
      orderBy: { version: 'desc' },
    });
  }
}

export const documentRepository = new DocumentRepository();
