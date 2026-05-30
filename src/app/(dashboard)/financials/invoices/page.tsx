
'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file financials/invoices/page.tsx
 * @description Institutional Invoice Center for trade finality and AR/AP management.
 */

const invoiceConfig: EntityConfig = {
  name: 'invoices',
  label: 'Invoice',
  pluralLabel: 'Invoice Center',
  searchKey: 'invoice_id',
  fields: [
    { name: 'invoice_id', label: 'Invoice ID', type: 'text', required: true, placeholder: 'e.g. INV-2024-001' },
    { name: 'order_id', label: 'Linked Order', type: 'text', required: true },
    { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
    { 
      name: 'status', 
      label: 'Settlement State', 
      type: 'select', 
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Issued', value: 'issued' },
        { label: 'Paid', value: 'paid' },
        { label: 'Disputed', value: 'disputed' }
      ],
      required: true 
    },
    { name: 'due_date', label: 'Due Date', type: 'date', required: true }
  ]
};

export default function InvoiceCenterPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={invoiceConfig} />
    </main>
  );
}
