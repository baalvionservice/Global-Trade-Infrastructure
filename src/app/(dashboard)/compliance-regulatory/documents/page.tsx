'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file documents/page.tsx
 * @description Management of regulatory documents using the generic CRUD engine.
 */

const docConfig: EntityConfig = {
  name: 'customs_documents',
  label: 'Customs Document',
  pluralLabel: 'Document Vault',
  searchKey: 'file_name',
  fields: [
    { name: 'shipment_id', label: 'Shipment ID', type: 'text', required: true },
    { 
      name: 'document_type', 
      label: 'Document Type', 
      type: 'select', 
      options: [
        { label: 'Commercial Invoice', value: 'invoice' },
        { label: 'Bill of Lading', value: 'bill_of_lading' },
        { label: 'Certificate of Origin', value: 'certificate' },
        { label: 'Packing List', value: 'packing_list' },
      ],
      required: true 
    },
    { name: 'file_name', label: 'File Name', type: 'text', required: true },
  ]
};

export default function CustomsDocumentsPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={docConfig} />
    </main>
  );
}
