'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file insurance/claims/page.tsx
 * @description Management of insurance claims using the generic CRUD engine.
 */

const claimConfig: EntityConfig = {
  name: 'claims',
  label: 'Insurance Claim',
  pluralLabel: 'Insurance Claims',
  searchKey: 'policy_id',
  fields: [
    { name: 'policy_id', label: 'Policy ID', type: 'text', required: true },
    { name: 'shipment_id', label: 'Shipment ID', type: 'text', required: true },
    { name: 'claim_amount', label: 'Claim Amount ($)', type: 'number', required: true },
    { 
      name: 'reason', 
      label: 'Incident Reason', 
      type: 'select', 
      options: [
        { label: 'Damage', value: 'damage' },
        { label: 'Loss of Cargo', value: 'loss' },
        { label: 'Significant Delay', value: 'delay' },
      ],
      required: true 
    },
    { 
      name: 'status', 
      label: 'Claim Status', 
      type: 'select', 
      options: [
        { label: 'Filed', value: 'filed' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      required: true 
    },
    { name: 'description', label: 'Incident Description', type: 'textarea', required: true },
  ]
};

export default function ClaimsPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={claimConfig} />
    </main>
  );
}
