-- CreateEnum
CREATE TYPE "ComplianceCheckType" AS ENUM ('KYC', 'KYB', 'AML', 'PEP', 'SANCTIONS', 'COUNTRY_RISK', 'DOCUMENT_VALIDATION', 'TRADE_RISK');

-- CreateEnum
CREATE TYPE "ComplianceOutcome" AS ENUM ('PASS', 'FAIL', 'REVIEW', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FinanceInstrumentType" AS ENUM ('LETTER_OF_CREDIT', 'BANK_GUARANTEE', 'INVOICE_FINANCING', 'FACTORING', 'SUPPLY_CHAIN_FINANCE', 'PURCHASE_ORDER_FINANCE');

-- CreateEnum
CREATE TYPE "FinanceStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'SETTLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "RiskStatus" NOT NULL,
    "factors" JSONB NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'default-v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID NOT NULL,
    "type" "ComplianceCheckType" NOT NULL,
    "outcome" "ComplianceOutcome" NOT NULL,
    "subject" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_finance_instruments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID NOT NULL,
    "type" "FinanceInstrumentType" NOT NULL,
    "status" "FinanceStatus" NOT NULL DEFAULT 'REQUESTED',
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" TEXT,
    "externalRef" TEXT,
    "terms" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "trade_finance_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financing_requests" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID NOT NULL,
    "instrumentId" UUID,
    "type" "FinanceInstrumentType" NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "FinanceStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedBy" TEXT NOT NULL,
    "decidedBy" TEXT,
    "reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "financing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "risk_assessments_organizationId_idx" ON "risk_assessments"("organizationId");

-- CreateIndex
CREATE INDEX "risk_assessments_tradeTransactionId_idx" ON "risk_assessments"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "compliance_checks_organizationId_idx" ON "compliance_checks"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_checks_tradeTransactionId_idx" ON "compliance_checks"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "compliance_checks_type_idx" ON "compliance_checks"("type");

-- CreateIndex
CREATE INDEX "compliance_checks_outcome_idx" ON "compliance_checks"("outcome");

-- CreateIndex
CREATE INDEX "trade_finance_instruments_organizationId_idx" ON "trade_finance_instruments"("organizationId");

-- CreateIndex
CREATE INDEX "trade_finance_instruments_tradeTransactionId_idx" ON "trade_finance_instruments"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "trade_finance_instruments_status_idx" ON "trade_finance_instruments"("status");

-- CreateIndex
CREATE INDEX "trade_finance_instruments_deletedAt_idx" ON "trade_finance_instruments"("deletedAt");

-- CreateIndex
CREATE INDEX "financing_requests_organizationId_idx" ON "financing_requests"("organizationId");

-- CreateIndex
CREATE INDEX "financing_requests_tradeTransactionId_idx" ON "financing_requests"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "financing_requests_status_idx" ON "financing_requests"("status");

-- CreateIndex
CREATE INDEX "financing_requests_deletedAt_idx" ON "financing_requests"("deletedAt");

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_finance_instruments" ADD CONSTRAINT "trade_finance_instruments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_finance_instruments" ADD CONSTRAINT "trade_finance_instruments_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financing_requests" ADD CONSTRAINT "financing_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financing_requests" ADD CONSTRAINT "financing_requests_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financing_requests" ADD CONSTRAINT "financing_requests_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "trade_finance_instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
