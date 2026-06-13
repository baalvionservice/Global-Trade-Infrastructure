/**
 * @file src/api/keys.ts
 * @description Centralized React Query key factory for the Trade Operations domain. Keeping every
 * key here means cache invalidation after a mutation is precise and never drifts from the hooks.
 */
export type ListParams = Record<string, unknown>;

const root = ['trade-ops'] as const;

export const qk = {
  shipments: {
    all: [...root, 'shipments'] as const,
    list: (params: ListParams) => [...root, 'shipments', 'list', params] as const,
    detail: (id: string) => [...root, 'shipments', 'detail', id] as const,
    track: (id: string) => [...root, 'shipments', 'track', id] as const,
  },
  workflows: {
    all: [...root, 'workflows'] as const,
    definition: [...root, 'workflows', 'definition'] as const,
    list: (params: ListParams) => [...root, 'workflows', 'list', params] as const,
    detail: (id: string) => [...root, 'workflows', 'detail', id] as const,
    transitions: (id: string) => [...root, 'workflows', 'transitions', id] as const,
  },
  documents: {
    all: [...root, 'documents'] as const,
    capabilities: [...root, 'documents', 'capabilities'] as const,
    list: (params: ListParams) => [...root, 'documents', 'list', params] as const,
    detail: (id: string) => [...root, 'documents', 'detail', id] as const,
    events: (id: string) => [...root, 'documents', 'events', id] as const,
  },
  validation: {
    all: [...root, 'validation'] as const,
    list: (params: ListParams) => [...root, 'validation', 'list', params] as const,
    detail: (id: string) => [...root, 'validation', 'detail', id] as const,
  },
  compliance: {
    all: [...root, 'compliance'] as const,
    screeningDefinition: [...root, 'compliance', 'screening', 'definition'] as const,
    screenings: (params: ListParams) => [...root, 'compliance', 'screenings', params] as const,
    lists: (params: ListParams) => [...root, 'compliance', 'lists', params] as const,
    agentDefinition: [...root, 'compliance', 'agent', 'definition'] as const,
    assessments: (params: ListParams) => [...root, 'compliance', 'assessments', params] as const,
    shipmentAssessment: (shipmentId: string) => [...root, 'compliance', 'agent', 'shipment', shipmentId] as const,
  },
  readiness: {
    all: [...root, 'readiness'] as const,
    definition: [...root, 'readiness', 'definition'] as const,
    list: (params: ListParams) => [...root, 'readiness', 'list', params] as const,
    forShipment: (shipmentId: string) => [...root, 'readiness', 'shipment', shipmentId] as const,
  },
  hscodes: {
    all: [...root, 'hscodes'] as const,
    search: (q: string) => [...root, 'hscodes', 'search', q] as const,
    classifications: (params: ListParams) => [...root, 'hscodes', 'classifications', params] as const,
    code: (code: string) => [...root, 'hscodes', 'code', code] as const,
  },
  logistics: {
    all: [...root, 'logistics'] as const,
    network: [...root, 'logistics', 'network'] as const,
    list: (params: ListParams) => [...root, 'logistics', 'list', params] as const,
    detail: (id: string) => [...root, 'logistics', 'detail', id] as const,
  },
  customs: {
    all: [...root, 'customs'] as const,
    channels: [...root, 'customs', 'channels'] as const,
    list: (params: ListParams) => [...root, 'customs', 'list', params] as const,
    detail: (id: string) => [...root, 'customs', 'detail', id] as const,
    events: (id: string) => [...root, 'customs', 'events', id] as const,
  },
  dispatch: {
    all: [...root, 'dispatch'] as const,
    config: [...root, 'dispatch', 'config'] as const,
    list: (params: ListParams) => [...root, 'dispatch', 'list', params] as const,
    detail: (id: string) => [...root, 'dispatch', 'detail', id] as const,
    events: (id: string) => [...root, 'dispatch', 'events', id] as const,
  },
} as const;
