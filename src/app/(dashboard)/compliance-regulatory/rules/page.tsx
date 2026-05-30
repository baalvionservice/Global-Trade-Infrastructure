/**
 * @file rules/page.tsx
 * @description Management of jurisdictional compliance rules using the generic CRUD engine.
 */
'use client';

import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';

const ruleConfig: EntityConfig = {
  name: 'compliance_rules',
  label: 'Compliance Rule',
  pluralLabel: 'Jurisdictional Rules',
  searchKey: 'description',
  fields: [
    { name: 'country', label: 'Country / Jurisdiction', type: 'text', required: true },
    { 
      name: 'rule_type', 
      label: 'Rule Category', 
      type: 'select', 
      options: [
        { label: 'Import Restriction', value: 'restriction' },
        { label: 'Export Control', value: 'export' },
        { label: 'Duty/Tax Policy', value: 'tax' },
        { label: 'Document Mandate', value: 'document' },
      ],
      required: true 
    },
    { 
      name: 'action', 
      label: 'System Action', 
      type: 'select', 
      options: [
        { label: 'Allow & Record', value: 'allow' },
        { label: 'Flag for Audit', value: 'flag' },
        { label: 'Block Transaction', value: 'block' },
      ],
      required: true 
    },
    { name: 'description', label: 'Rule Description', type: 'textarea', required: true },
    { name: 'condition', label: 'Logical Condition (Mock)', type: 'text', placeholder: 'e.g. category == "Electronics"' },
  ]
};

export default function ComplianceRulesPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen">
      <EntityManager config={ruleConfig} />
    </main>
  );
}
