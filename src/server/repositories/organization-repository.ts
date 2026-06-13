/**
 * @file server/repositories/organization-repository.ts
 * @description Repository for tenant organizations.
 */
import { Organization } from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

export class OrganizationRepository extends BaseRepository<Organization> {
  protected readonly entityName = 'Organization';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Organization> {
    return client(tx).organization as unknown as ModelDelegate<Organization>;
  }
  async findBySlug(slug: string, tx?: PrismaTransaction): Promise<Organization | null> {
    return this.findOne({ slug }, tx);
  }
}

export const organizationRepository = new OrganizationRepository();
