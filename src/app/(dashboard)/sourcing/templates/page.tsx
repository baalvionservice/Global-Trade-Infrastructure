
'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

/**
 * @file sourcing/templates/page.tsx
 * @description Registry for standardized institutional sourcing briefs.
 */

const templateConfig: EntityConfig = {
  name: 'sourcing_templates',
  label: 'Sourcing Template',
  pluralLabel: 'Strategic Templates',
  searchKey: 'name',
  fields: [
    { name: 'name', label: 'Template Name', type: 'text', required: true, placeholder: 'e.g. Tier 1 PV Module Spec' },
    { 
      name: 'category', 
      label: 'Industrial Sector', 
      type: 'select', 
      options: [
        { label: 'Renewable Energy', value: 'Energy' },
        { label: 'Industrial Metals', value: 'Metals' },
        { label: 'Electronics', value: 'Electronics' }
      ],
      required: true 
    },
    { name: 'description', label: 'Brief Description', type: 'textarea', required: true },
    { name: 'quality_score_min', label: 'Min Quality Score (%)', type: 'number', required: true }
  ]
};

export default function SourcingTemplatesPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={templateConfig} />
    </main>
  );
}
