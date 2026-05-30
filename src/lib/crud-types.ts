
/**
 * @file crud-types.ts
 * @description Shared types for the metadata-driven CRUD engine.
 */

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'textarea' | 'badge';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select fields
  required?: boolean;
}

export interface EntityConfig {
  name: string;
  label: string;
  pluralLabel: string;
  fields: FieldConfig[];
  searchKey: string;
}
