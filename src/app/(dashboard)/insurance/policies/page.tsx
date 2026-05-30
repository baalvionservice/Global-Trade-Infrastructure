'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file insurance/policies/page.tsx
 * @description Management of institutional insurance policies using the generic CRUD engine.
 */

const policyConfig: EntityConfig = {
  name: 'policies',
  label: 'Insurance Policy',
  pluralLabel: 'Insurance Policies',
  searchKey: 'shipment_id',
  fields: [
    { name: 'shipment_id', label: 'Shipment ID', type: 'text', required: true, placeholder: 'e.g. SHP-4421' },
    { 
      name: 'coverage_type', 
      label: 'Coverage Type', 
      type: 'select', 
      options: [
        { label: 'Basic (1%)', value: 'basic' },
        { label: 'Premium (2%)', value: 'premium' },
        { label: 'Full Protection (3%)', value: 'full' },
      ],
      required: true 
    },
    { name: 'insured_value', label: 'Insured Value ($)', type: 'number', required: true },
    { 
      name: 'status', 
      label: 'Policy Status', 
      type: 'select', 
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true 
    },
    { name: 'start_date', label: 'Effective Date', type: 'date', required: true },
    { name: 'end_date', label: 'Expiry Date', type: 'date', required: true },
  ]
};

export default function PoliciesPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={policyConfig} />
    </main>
  );
}
