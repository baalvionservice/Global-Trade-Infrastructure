'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file policies/page.tsx
 * @description Management of institutional governance policies.
 */

const policyConfig: EntityConfig = {
  name: 'policies',
  label: 'Governance Policy',
  pluralLabel: 'Policy Registry',
  searchKey: 'name',
  fields: [
    { name: 'name', label: 'Policy Name', type: 'text', required: true },
    { 
      name: 'scope', 
      label: 'Policy Scope', 
      type: 'select', 
      options: [
        { label: 'Payment Operations', value: 'payment' },
        { label: 'Shipment Logistics', value: 'shipment' },
        { label: 'Compliance & KYC', value: 'compliance' },
        { label: 'User Access', value: 'user' },
      ],
      required: true 
    },
    { 
      name: 'action', 
      label: 'Decision Action', 
      type: 'select', 
      options: [
        { label: 'Allow Action', value: 'allow' },
        { label: 'Block Action', value: 'block' },
        { label: 'Require Admin Approval', value: 'require_approval' },
      ],
      required: true 
    },
    { name: 'condition', label: 'Logical Condition', type: 'text', required: true, placeholder: 'e.g. amount > 100000' },
    { 
      name: 'status', 
      label: 'Policy State', 
      type: 'select', 
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      required: true 
    },
  ]
};

export default function PolicyManagementPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={policyConfig} />
    </main>
  );
}
