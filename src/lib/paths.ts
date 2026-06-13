/**
 * @file paths.ts
 * @description THE AUTHORITATIVE PATH REGISTRY for the Baalvion Eternal Absolute Singularity.
 */

export const PATHS = {
  // --- PUBLIC INSTITUTIONAL GATEWAY ---
  HOME: '/',
  PLATFORM: '/platform',
  SOLUTIONS_BANKS: '/banks',
  SOLUTIONS_GOV: '/governments',
  SOLUTIONS_ENTERPRISES: '/enterprises',
  SOLUTIONS_LOGISTICS: '/logistics',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  ACCESS_REQUEST: '/access/request',
  ACCESS_PENDING: '/access/pending',
  ONBOARD: '/onboard',
  ONBOARD_BUYER: '/onboard/buyer',
  ONBOARD_SELLER: '/onboard/seller',
  ONBOARD_ENTERPRISE: '/onboard/enterprise',
  ONBOARD_BANKING: '/onboard/banking',
  ONBOARD_CUSTOMS: '/onboard/customs',
  ONBOARD_LOGISTICS: '/onboard/logistics',
  GOVERNANCE_ONBOARDING: '/governance/onboarding',
  GOVERNANCE_PLATFORM_STATUS: '/governance/platform-status',
  LOGIN: '/login',
  PRIVACY_POLICY: '/privacy',
  TERMS_OF_USE: '/terms',

  // --- CORE OPERATIONAL COMMAND ---
  DASHBOARD: '/dashboard',
  BUYER_DASHBOARD: '/buyer/dashboard',
  SELLER_DASHBOARD: '/seller/dashboard',
  
  // 1. DISCOVERY & STRATEGIC SIGNALS
  MARKETPLACE: '/marketplace',
  SELLER_RFQS: '/seller/rfqs',
  SELLER_RESPONSES: '/seller/responses',
  BUYER_RFQS: '/buyer/rfqs',
  COMPLIANCE_RULES: '/compliance-regulatory/rules',
  CUSTOMS_DECLARATIONS: '/compliance-regulatory/declarations',
  GOVERNANCE_DISPUTES: '/governance/disputes',
  GOVERNANCE_RESILIENCE: '/governance/resilience',
  MARKET_SIGNALS: '/discovery/signals',
  OPPORTUNITY_RADAR: '/discovery/radar',

  // 2. NEGOTIATIONS & LEGAL FINALITY
  DEALS: '/deals',
  CONTRACT_WORKSPACE: '/negotiations/contracts',

  // 3. EXECUTION & MISSION CONTROL
  ORDERS: '/orders',
  LOGISTICS_SHIPMENT: '/logistics-shipment',
  LOGISTICS_MARKETPLACE: '/carriers',
  FIELD_OPERATIONS: '/field/operations',
  AGENTS: '/agents',
  AGENT_REQUESTS: '/agent/requests',

  // 4. FINANCIALS & TREASURY
  PAYMENTS: '/payments',
  FINANCE_SETTLEMENT: '/finance-settlement',
  TREASURY: '/financials/treasury',
  ESCROW: '/escrow',
  CREDIT_LINES: '/financials/credit-lines',

  // 5. SOVEREIGN GOVERNANCE & COMMAND TOWERS
  EXECUTIVE_COMMAND: '/governance/control-tower',
  SOVEREIGN_WAR_ROOM: '/governance/war-room',
  GOVERNANCE_ECOSYSTEM: '/governance/ecosystem',
  GOVERNANCE_STABILIZATION: '/governance/stabilization',
  GOVERNANCE_SIMULATION: '/governance/simulation',
  GOVERNANCE_AUDIT: '/governance/audit-logs',
  OVERSIGHT_DISPUTES: '/governance/disputes',
  OVERSIGHT_PLATFORM_ADMIN: '/governance/platform-admin',
  OVERSIGHT_SOVEREIGN: '/governance/sovereign-admin',
  
  // 6. COMPLIANCE & CUSTOMS
  KYC: '/compliance/kyc',
  SANCTIONS_SCREENING: '/sanctions-screening',
  CUSTOMS_COMMAND: '/governance/customs',
  REGULATORY_INTEL: '/governance/regulatory',
  COMPLIANCE_CONTROL: '/governance/compliance',
  GOVERNANCE_COMPLIANCE: '/governance/compliance-admin',
  ADMIN_RISK: '/governance/compliance-admin/risk',
  GOVERNANCE_BANK: '/governance/bank-admin',
  GOVERNANCE_INTELLIGENCE: '/governance/intelligence',

  // 7. INTELLIGENCE & COGNITION
  INTELLIGENCE_HUB: '/intelligence-hub',
  STRATEGIC_ANALYTICS: '/intelligence-hub/analytics',
  AI_COMMAND: '/governance/ai-command-center',
  MARITIME_INTEL: '/intelligence-hub/maritime',
  GEOPOLITICAL_MONITORING: '/intelligence-hub/geopolitical',

  // 8. INFRASTRUCTURE & RESILIENCE
  INFRA_COMMAND: '/governance/infrastructure',
  RESILIENCE_COMMAND: '/governance/resilience',
  DEPLOYMENT_OPS: '/governance/deployment',
  OBSERVABILITY_OPS: '/governance/observability',
  AUTOMATION_OPS: '/governance/automation',

  // 9. SYSTEM ADMINISTRATION
  // Platform console (platform_owner org type only)
  PLATFORM_ORGANIZATIONS: '/platform/organizations',
  // Organization self-administration (all org types, owner/admin capability)
  ORGANIZATION_SETTINGS: '/organization/settings',
  ORGANIZATION_USERS: '/organization/users',
  ORGANIZATION_AUDIT: '/organization/audit',
  // Auth utility routes (public — no session required)
  ACCEPT_INVITE: '/accept-invite',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  // Account security (auth-required, covered by /settings prefix)
  MFA_SETUP: '/settings/mfa',
  PROFILE: '/profile',
  DOCUMENTS: '/documents',
  MESSAGES: '/messages',
  HS_CODES: '/compliance/hs-codes',
  REVERSE_AUCTIONS: '/marketplace/reverse-auctions',
  SECURITY_COMMAND: '/governance/security',

  // 10. PROTECTION
  INSURANCE: '/insurance',
  INSURANCE_POLICIES: '/insurance/policies',
  INSURANCE_CLAIMS: '/insurance/claims',

  // 11. SUPREME COMMAND
  SINGULARITY_COMMAND: '/singularity-command',
  INFINITY_COMMAND: '/infinity-command',
  ETERNAL_COMMAND: '/eternal-command',
  QUANTUM_COMMAND: '/quantum-command',
  CONTINUITY_COMMAND: '/continuity-command',
  ASCENSION_COMMAND: '/ascension-command',
  ABSOLUTE_INFINITY_COMMAND: '/absolute-infinity-command',
  GODSYSTEM_COMMAND: '/godsystem-command',
  ETERNAL_ABSOLUTE_COMMAND: '/eternal-absolute-command'
} as const;
