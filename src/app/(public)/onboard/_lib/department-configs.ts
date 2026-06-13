/**
 * @file department-configs.ts
 * @description Data-driven onboarding definitions for every department persona.
 * Each config declares the steps, fields, documents, and screening checks a
 * given institution must complete — grounded in what that department's backend
 * actually needs to verify (settlement authority, customs gateways, lane
 * coverage, etc.). The shared <DepartmentWizard> renders any of these.
 */

import {
  Landmark, ShieldCheck, FileUp, Building2, ScanFace, Banknote, Globe, Truck,
  Route, Boxes, ScrollText, UserCircle, Scale, ArrowDownUp, type LucideIcon,
} from 'lucide-react';

export type WizardFieldType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'select' | 'textarea';

export interface WizardField {
  key: string;
  label: string;
  type: WizardFieldType;
  placeholder?: string;
  options?: string[];
  full?: boolean;
  /** Defaults to true. Set false for genuinely optional fields. */
  optional?: boolean;
}

export interface WizardDoc {
  key: string;
  label: string;
  hint?: string;
}

export type WizardStep =
  | { kind: 'form'; nav: string; icon: LucideIcon; title: string; sub: string; fields: WizardField[] }
  | { kind: 'docs'; nav: string; icon: LucideIcon; title: string; sub: string; docs: WizardDoc[] };

export interface DepartmentConfig {
  slug: string;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  steps: WizardStep[];
  screening: { title: string; sub: string; checks: string[] };
  success: { title: string; blurb: string; reviewNote: string };
}

const COUNTRIES = ['United States', 'United Arab Emirates', 'India', 'Singapore', 'Germany', 'United Kingdom', 'China', 'Brazil', 'Netherlands', 'Other'];
const VOLUME_BANDS = ['< $1M', '$1M – $10M', '$10M – $50M', '$50M – $250M', '$250M+'];

const ACCOUNT_STEP = (placeholder: string): WizardStep => ({
  kind: 'form',
  nav: 'Account',
  icon: UserCircle,
  title: 'Create your account',
  sub: 'Your secure institutional identity. This becomes the primary administrator.',
  fields: [
    { key: 'email', label: 'Work Email', type: 'email', placeholder },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••••' },
    { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
    { key: 'role', label: 'Role / Title', type: 'text', placeholder: 'Head of Trade Finance' },
  ],
});

const SCREENING_BASE = ['Screening OFAC / UN / EU / UK sanctions lists', 'Running PEP (Politically Exposed Person) check', 'Scanning global adverse-media databases'];

export const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  banking: {
    slug: 'banking',
    eyebrow: 'Banking Authority Verification',
    title: 'Become a Verified Settlement Partner',
    icon: Landmark,
    steps: [
      ACCOUNT_STEP('treasury@bank.com'),
      {
        kind: 'form', nav: 'Institution', icon: Building2,
        title: 'Institution details', sub: 'The regulated entity that will hold and move funds.',
        fields: [
          { key: 'legalName', label: 'Legal Institution Name', type: 'text', placeholder: 'Global Bank Corporation' },
          { key: 'institutionType', label: 'Institution Type', type: 'select', options: ['Commercial Bank', 'Investment Bank', 'Payment Institution', 'Trade Financier'] },
          { key: 'jurisdiction', label: 'Primary Jurisdiction', type: 'select', options: COUNTRIES },
          { key: 'regulator', label: 'Lead Regulator', type: 'text', placeholder: 'e.g. RBI, FCA, MAS, Federal Reserve' },
        ],
      },
      {
        kind: 'form', nav: 'Settlement', icon: ArrowDownUp,
        title: 'Settlement authority', sub: 'How money will settle through your institution on Baalvion.',
        fields: [
          { key: 'settlementAccount', label: 'Settlement Account / IBAN', type: 'text', placeholder: 'IBAN or account reference' },
          { key: 'settlementCurrency', label: 'Primary Settlement Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'AED', 'INR', 'SGD', 'CNY'] },
          { key: 'escrowAuthority', label: 'Authorized to Hold Client Escrow Funds?', type: 'select', options: ['Yes — licensed to hold client funds', 'No — settlement only'] },
          { key: 'monthlyVolume', label: 'Expected Monthly Settlement Volume', type: 'select', options: VOLUME_BANDS },
        ],
      },
      {
        kind: 'docs', nav: 'Documents', icon: FileUp,
        title: 'Upload regulatory documents', sub: 'Encrypted at rest. Used only for compliance and licensing review.',
        docs: [
          { key: 'bankingLicense', label: 'Banking / Payment Institution License' },
          { key: 'regulatorAuth', label: 'Regulator Authorization' },
          { key: 'amlPolicy', label: 'AML / CFT Policy' },
          { key: 'signatoryId', label: 'Authorized Signatory ID' },
        ],
      },
    ],
    screening: {
      title: 'Licensing & compliance review',
      sub: 'We validate your license and regulatory standing before provisioning settlement access.',
      checks: ['Validating banking / payment license', 'Confirming regulator registration', ...SCREENING_BASE, 'Provisioning settlement sandbox'],
    },
    success: {
      title: 'Settlement Partner Application Submitted',
      blurb: 'Your institution is queued for licensing and compliance review by our governance team.',
      reviewNote: 'Settlement, escrow, and ledger access are activated only after manual approval and a sandbox integration call.',
    },
  },

  customs: {
    slug: 'customs',
    eyebrow: 'Customs Authority Verification',
    title: 'Become a Verified Customs Filer',
    icon: Globe,
    steps: [
      ACCOUNT_STEP('filings@customs-broker.com'),
      {
        kind: 'form', nav: 'Authority', icon: Scale,
        title: 'Authority details', sub: 'The licensed broker or customs authority that will file declarations.',
        fields: [
          { key: 'legalName', label: 'Broker / Authority Name', type: 'text', placeholder: 'Apex Customs Brokers' },
          { key: 'entityType', label: 'Entity Type', type: 'select', options: ['Licensed Customs Broker', 'National Customs Authority', 'Freight Forwarder (with brokerage)'] },
          { key: 'jurisdiction', label: 'Primary Jurisdiction', type: 'select', options: COUNTRIES },
          { key: 'brokerLicense', label: 'Customs Broker License No.', type: 'text', placeholder: 'CB-000000' },
        ],
      },
      {
        kind: 'form', nav: 'Gateways', icon: Route,
        title: 'Filing gateways', sub: 'Which national customs systems you file through.',
        fields: [
          { key: 'primaryGateway', label: 'Primary Customs Gateway', type: 'select', options: ['ICEGATE (India)', 'ACE (United States)', 'CDS (European Union)', 'Mirsal (UAE)'] },
          { key: 'filerCode', label: 'Broker / Filer Code', type: 'text', placeholder: 'Filer or AEO code' },
          { key: 'additionalGateways', label: 'Additional Gateways', type: 'textarea', placeholder: 'List any other gateways you operate', full: true, optional: true },
          { key: 'declarationVolume', label: 'Annual Declaration Volume', type: 'select', options: ['< 1,000', '1,000 – 10,000', '10,000 – 100,000', '100,000+'] },
        ],
      },
      {
        kind: 'docs', nav: 'Documents', icon: FileUp,
        title: 'Upload authorization documents', sub: 'Encrypted at rest. Used only for authority verification.',
        docs: [
          { key: 'brokerLicenseDoc', label: 'Customs Broker License' },
          { key: 'authLetter', label: 'Authority Authorization Letter' },
          { key: 'officerId', label: 'Authorized Officer Government ID' },
          { key: 'powerOfAttorney', label: 'Power of Attorney (if filing on behalf of importers)' },
        ],
      },
    ],
    screening: {
      title: 'Authority verification',
      sub: 'We confirm your broker license and gateway filer code before enabling live filing.',
      checks: ['Validating customs broker license', 'Confirming gateway filer code', ...SCREENING_BASE, 'Provisioning customs filing sandbox'],
    },
    success: {
      title: 'Customs Filer Application Submitted',
      blurb: 'Your authority is queued for verification against the declared customs gateway.',
      reviewNote: 'Live filing into ICEGATE / ACE / CDS / Mirsal is enabled only after manual approval.',
    },
  },

  logistics: {
    slug: 'logistics',
    eyebrow: 'Logistics Operator Verification',
    title: 'Become a Verified Carrier Partner',
    icon: Truck,
    steps: [
      ACCOUNT_STEP('ops@carrier.com'),
      {
        kind: 'form', nav: 'Company', icon: Building2,
        title: 'Company details', sub: 'The operator that will move freight on the network.',
        fields: [
          { key: 'legalName', label: 'Legal Company Name', type: 'text', placeholder: 'Oceanic Freight Lines' },
          { key: 'operatorType', label: 'Operator Type', type: 'select', options: ['Ocean Carrier', 'Air Carrier', 'Freight Forwarder', '3PL / 4PL', 'Trucking / Road'] },
          { key: 'jurisdiction', label: 'Primary Jurisdiction', type: 'select', options: COUNTRIES },
          { key: 'fleetSize', label: 'Fleet / Network Size', type: 'select', options: ['1–10 assets', '11–50', '51–200', '200+', 'Asset-light (forwarder)'] },
        ],
      },
      {
        kind: 'form', nav: 'Coverage', icon: Boxes,
        title: 'Network coverage', sub: 'The lanes and modes you can serve, so we can map you to the trade network.',
        fields: [
          { key: 'modes', label: 'Transport Modes', type: 'select', options: ['Ocean', 'Air', 'Road', 'Rail', 'Multimodal'] },
          { key: 'lanes', label: 'Primary Trade Lanes', type: 'textarea', placeholder: 'e.g. Mumbai (INNSA) → Rotterdam (NLRTM); Shanghai → Los Angeles', full: true },
          { key: 'carrierCode', label: 'Carrier Account / SCAC Code', type: 'text', placeholder: 'SCAC or carrier reference', optional: true },
          { key: 'monthlyShipments', label: 'Average Monthly Shipments', type: 'select', options: ['< 100', '100 – 1,000', '1,000 – 10,000', '10,000+'] },
        ],
      },
      {
        kind: 'docs', nav: 'Documents', icon: FileUp,
        title: 'Upload operating documents', sub: 'Encrypted at rest. Used only for operator verification.',
        docs: [
          { key: 'operatingLicense', label: 'Operating License / Permit' },
          { key: 'insuranceCert', label: 'Cargo / Liability Insurance Certificate' },
          { key: 'carrierAgreement', label: 'Carrier Agreement / Tariff Sheet' },
          { key: 'repId', label: 'Authorized Representative ID' },
        ],
      },
    ],
    screening: {
      title: 'Operator verification',
      sub: 'We validate your license and insurance, then map your lanes onto the trade network.',
      checks: ['Validating operating license', 'Verifying cargo insurance coverage', ...SCREENING_BASE, 'Mapping declared lanes to trade network'],
    },
    success: {
      title: 'Carrier Partner Application Submitted',
      blurb: 'Your operation is queued for verification and lane mapping by our network team.',
      reviewNote: 'Carrier marketplace and control-tower access are activated only after manual approval.',
    },
  },

  enterprise: {
    slug: 'enterprise',
    eyebrow: 'Enterprise Verification',
    title: 'Onboard Your Trading Organization',
    icon: Boxes,
    steps: [
      ACCOUNT_STEP('trade@enterprise.com'),
      {
        kind: 'form', nav: 'Company', icon: Building2,
        title: 'Company details', sub: 'Your registered trading organization.',
        fields: [
          { key: 'legalName', label: 'Legal Company Name', type: 'text', placeholder: 'Meridian Trading Ltd.' },
          { key: 'registrationNo', label: 'Registration Number', type: 'text', placeholder: 'REG-000000' },
          { key: 'address', label: 'Registered Address', type: 'text', placeholder: 'Street, City, Country', full: true },
          { key: 'website', label: 'Website', type: 'url', placeholder: 'https://company.com', optional: true },
        ],
      },
      {
        kind: 'form', nav: 'Trade Profile', icon: Globe,
        title: 'Trade profile', sub: 'What you trade and where, so we can pre-configure your workspace.',
        fields: [
          { key: 'tradeRole', label: 'Role in Trade', type: 'select', options: ['Importer', 'Exporter', 'Importer & Exporter', 'Trading House'] },
          { key: 'goods', label: 'Primary Goods / HS Categories', type: 'text', placeholder: 'e.g. Coffee, textiles, machinery' },
          { key: 'corridors', label: 'Primary Trade Corridors', type: 'textarea', placeholder: 'e.g. India → EU; UAE → East Africa', full: true },
          { key: 'annualVolume', label: 'Annual Trade Volume (USD)', type: 'select', options: VOLUME_BANDS },
        ],
      },
      {
        kind: 'docs', nav: 'Documents', icon: FileUp,
        title: 'Upload verification documents', sub: 'Encrypted at rest. Used only for KYB / compliance screening.',
        docs: [
          { key: 'incorporation', label: 'Certificate of Incorporation' },
          { key: 'directorId', label: 'Director / UBO ID' },
          { key: 'bankReference', label: 'Bank Reference Letter' },
          { key: 'vatGst', label: 'VAT / GST Registration' },
        ],
      },
    ],
    screening: {
      title: 'KYB & compliance screening',
      sub: 'We verify your organization and beneficial owners before activating your workspace.',
      checks: ['Verifying company registration', 'Resolving ultimate beneficial owners', ...SCREENING_BASE, 'Computing Baalvion Trade Score'],
    },
    success: {
      title: 'Enterprise Application Submitted',
      blurb: 'Your organization is queued for KYB and compliance review.',
      reviewNote: 'Your trading workspace is activated once verification clears — typically within one business day.',
    },
  },
};

export const DEPARTMENT_SLUGS = Object.keys(DEPARTMENT_CONFIGS);

export function getDepartmentConfig(slug: string): DepartmentConfig | null {
  return DEPARTMENT_CONFIGS[slug] ?? null;
}

/** Cards for the /onboard hub. */
export interface DepartmentCard {
  slug: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

export const DEPARTMENT_CARDS: DepartmentCard[] = [
  { slug: 'enterprise', title: 'Enterprise / Trader', desc: 'Importers, exporters, and trading houses running deals end to end.', icon: Boxes },
  { slug: 'banking', title: 'Bank / Financier', desc: 'Hold escrow, post the ledger, and settle trade flows.', icon: Landmark },
  { slug: 'customs', title: 'Customs Authority', desc: 'File declarations through ICEGATE, ACE, CDS, or Mirsal.', icon: Globe },
  { slug: 'logistics', title: 'Logistics / Carrier', desc: 'Move freight and plug into the route + tracking network.', icon: Truck },
];
