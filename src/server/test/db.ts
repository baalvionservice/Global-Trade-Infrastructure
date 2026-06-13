/**
 * @file server/test/db.ts
 * @description Test database helpers — truncate-between-tests and org seeding.
 */
import { prisma } from '../db/prisma';
import { organizationRepository } from '../repositories';

const TABLES = [
  'workflow_events',
  'domain_events',
  'dead_letter_events',
  'audit_logs',
  'notifications',
  'documents',
  'rfqs',
  'deals',
  'orders',
  'escrows',
  'payments',
  'shipments',
  'customs_declarations',
  'settlements',
  'trade_transactions',
  'buyers',
  'suppliers',
  'user_roles',
  'role_permissions',
  'users',
  'roles',
  'permissions',
  'organizations',
];

export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`,
  );
}

export async function seedOrganization(name = 'Acme Trading'): Promise<string> {
  const org = await organizationRepository.create({
    name,
    slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Date.now() % 1e9)}`,
    type: 'GENERIC',
  });
  return org.id;
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
