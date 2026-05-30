/**
 * @file hs-codes/page.tsx
 * @description Management of the Harmonized System (HS) classification library.
 */
'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

const hsConfig: EntityConfig = {
  name: 'hs_codes',
  label: 'HS Code',
  pluralLabel: 'HS Code Library',
  searchKey: 'code',
  fields: [
    { name: 'code', label: 'HS Code', type: 'text', required: true, placeholder: 'e.g. 8541.43' },
    { name: 'description', label: 'Product Description', type: 'text', required: true },
    { 
      name: 'category', 
      label: 'Trade Category', 
      type: 'select', 
      options: [
        { label: 'Energy', value: 'Energy' },
        { label: 'Metals', value: 'Metals' },
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Defense', value: 'Defense' },
        { label: 'Agriculture', value: 'Agriculture' },
      ],
      required: true 
    },
    { name: 'duty_percentage', label: 'Standard Duty (%)', type: 'number', required: true },
    { name: 'tax_percentage', label: 'Landing Tax (%)', type: 'number', required: true },
    { 
      name: 'restricted', 
      label: 'Restricted Commodity', 
      type: 'select', 
      options: [
        { label: 'No - Standard Trade', value: 'false' },
        { label: 'Yes - Controlled Item', value: 'true' },
      ],
      required: true 
    },
  ]
};

export default function HSCodesPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={hsConfig} />
    </main>
  );
}
