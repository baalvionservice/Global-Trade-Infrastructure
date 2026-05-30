'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file declarations/page.tsx
 * @description Management of customs declarations using the generic CRUD engine.
 */

const declarationConfig: EntityConfig = {
  name: 'declarations',
  label: 'Customs Declaration',
  pluralLabel: 'Declarations',
  searchKey: 'importer_name',
  fields: [
    { name: 'shipment_id', label: 'Shipment ID', type: 'text', required: true, placeholder: 'e.g. SHP-4421' },
    { name: 'importer_name', label: 'Importer', type: 'text', required: true },
    { name: 'exporter_name', label: 'Exporter', type: 'text', required: true },
    { name: 'country_of_origin', label: 'Origin Country', type: 'text', required: true },
    { name: 'destination_country', label: 'Destination', type: 'text', required: true },
    { name: 'HS_code', label: 'HS Code', type: 'text', required: true, placeholder: 'e.g. 8541.43' },
    { name: 'declared_value', label: 'Declared Value ($)', type: 'number', required: true },
    { 
      name: 'status', 
      label: 'Clearance Status', 
      type: 'select', 
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Cleared', value: 'cleared' },
        { label: 'Rejected', value: 'rejected' },
      ],
      required: true 
    },
    { name: 'goods_description', label: 'Description of Goods', type: 'textarea' },
  ]
};

export default function DeclarationsPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={declarationConfig} />
    </main>
  );
}
