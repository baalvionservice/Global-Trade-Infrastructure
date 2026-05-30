
/**
 * @file sourcing-repository.ts
 * @description Specialized repository for Sourcing (RFQs and Quotations).
 */
import { BaseRepository } from './base-repository';
import { RFQ, Quotation } from '@/types/institutional';

export class RFQRepository extends BaseRepository<RFQ> {
  constructor() {
    super('rfqs', 'SOURCING');
  }

  async getOpenRfqsBySector(category: string): Promise<RFQ[]> {
    return this.query({ category, status: 'OPEN' });
  }
}

export class QuotationRepository extends BaseRepository<Quotation> {
  constructor() {
    super('quotations', 'SOURCING');
  }

  async getByRfqId(rfqId: string): Promise<Quotation[]> {
    return this.query({ rfqId });
  }
}

export const rfqRepository = new RFQRepository();
export const quotationRepository = new QuotationRepository();
