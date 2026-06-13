/**
 * @file server/documents/document-service.ts
 * @description Trade document repository service (Agent 12). Versioned trade
 * documents (invoices, POs, bills of lading, certificates, customs docs) bound
 * to a trade, with a pluggable storage abstraction. Mutations are audited and
 * emit domain events.
 */
import { Document, Prisma } from '@prisma/client';
import { UserRole } from '@/core/roles';
import { eventBus } from '@/orchestration/event-bus';
import { withTransaction } from '../db/prisma';
import { tradeRepository, documentRepository, auditRepository } from '../repositories';
import { NotFoundError } from '../db/errors';
import { ensureEventStore } from '../orchestration/event-store';

/** Pluggable binary storage (S3/GCS/local). Default records metadata only. */
export interface StoragePort {
  put(key: string, content: Buffer): Promise<{ url: string; hash: string }>;
}

export interface AddDocumentInput {
  tradeId: string;
  kind: string;
  entityType?: string;
  entityId?: string;
  url?: string;
  hash?: string;
  metadata?: Record<string, unknown>;
  actorId: string;
  actorRole: UserRole;
}

function asJson(v: unknown): Prisma.InputJsonValue {
  return v as Prisma.InputJsonValue;
}

export const documentService = {
  /** Attach a new document version for a trade, superseding the prior active one of the same kind. */
  async addDocument(input: AddDocumentInput): Promise<Document> {
    ensureEventStore();
    const trade = await tradeRepository.findById(input.tradeId);
    if (!trade) throw new NotFoundError('TradeTransaction', input.tradeId);

    const doc = await withTransaction(async (tx) => {
      const previous = await documentRepository.latestVersion(trade.id, input.kind, tx);
      if (previous) {
        await documentRepository.update(previous.id, { status: 'superseded' }, tx);
      }
      const created = await documentRepository.create(
        {
          organizationId: trade.organizationId,
          tradeTransactionId: trade.id,
          entityType: input.entityType ?? 'TradeTransaction',
          entityId: input.entityId ?? null,
          kind: input.kind,
          url: input.url ?? null,
          hash: input.hash ?? null,
          status: 'active',
          version: (previous?.version ?? 0) + 1,
          metadata: input.metadata ? asJson(input.metadata) : undefined,
        },
        tx,
      );
      await auditRepository.record(
        {
          organizationId: trade.organizationId,
          tradeId: trade.id,
          entityType: 'Document',
          entityId: created.id,
          action: 'ADD_DOCUMENT',
          actorId: input.actorId,
          actorRole: String(input.actorRole),
          source: 'documents',
          afterState: asJson({ kind: input.kind, version: created.version }),
          correlationId: trade.correlationId,
        },
        tx,
      );
      return created;
    });

    await eventBus.publish('document.added', {
      tradeId: trade.id,
      documentId: doc.id,
      kind: doc.kind,
      version: doc.version,
      actorId: input.actorId,
      correlationId: trade.correlationId,
    });
    return doc;
  },

  listForTrade(tradeId: string): Promise<Document[]> {
    return documentRepository.listByTrade(tradeId);
  },

  getById(id: string): Promise<Document | null> {
    return documentRepository.findById(id);
  },
};

/** Default storage: persists metadata only (binary handled by an external CDN/object store). */
export class MetadataOnlyStorage implements StoragePort {
  async put(key: string, content: Buffer): Promise<{ url: string; hash: string }> {
    const { createHash } = await import('node:crypto');
    const hash = createHash('sha256').update(content).digest('hex');
    return { url: `metadata://${key}`, hash };
  }
}
