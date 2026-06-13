-- CreateEnum
CREATE TYPE "TradeState" AS ENUM ('RFQ_CREATED', 'RFQ_SUBMITTED', 'RFQ_ACCEPTED', 'RFQ_REJECTED', 'DEAL_CREATED', 'DEAL_NEGOTIATION', 'DEAL_APPROVED', 'ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_EXECUTING', 'ESCROW_CREATED', 'ESCROW_FUNDED', 'SHIPMENT_CREATED', 'SHIPMENT_PICKED_UP', 'SHIPMENT_IN_TRANSIT', 'SHIPMENT_CUSTOMS', 'SHIPMENT_DELIVERED', 'SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED', 'TRADE_COMPLETED', 'TRADE_CANCELLED');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('PENDING', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'CLEARED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "WorkflowEventType" AS ENUM ('TRANSITION', 'COMPENSATION', 'GENESIS');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PLATFORM_OWNER', 'BUYER', 'SUPPLIER', 'BANK', 'CUSTOMS', 'CARRIER', 'INSURER', 'REGULATOR', 'INSPECTOR', 'GENERIC');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'GENERIC',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "externalRef" TEXT,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "externalRef" TEXT,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_transactions" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "buyerId" UUID,
    "supplierId" UUID,
    "rfqId" UUID,
    "dealId" UUID,
    "orderId" UUID,
    "escrowId" UUID,
    "paymentId" UUID,
    "shipmentId" UUID,
    "customsId" UUID,
    "settlementId" UUID,
    "currentState" "TradeState" NOT NULL DEFAULT 'RFQ_CREATED',
    "riskStatus" "RiskStatus" NOT NULL DEFAULT 'PENDING',
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "terms" JSONB NOT NULL,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "trade_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RFQ_CREATED',
    "commodity" TEXT NOT NULL,
    "quantity" DECIMAL(20,4) NOT NULL,
    "unitPrice" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DEAL_CREATED',
    "unitPrice" DECIMAL(20,4) NOT NULL,
    "quantity" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ORDER_CREATED',
    "totalAmount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "destinationCountry" TEXT,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrows" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ESCROW_CREATED',
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fxRate" DECIMAL(20,8),
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SHIPMENT_CREATED',
    "carrier" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "trackingNumber" TEXT,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customs_declarations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SHIPMENT_CUSTOMS',
    "country" TEXT,
    "hsCode" TEXT,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customs_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "externalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SETTLEMENT_PENDING',
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tradeTransactionId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "kind" TEXT NOT NULL,
    "url" TEXT,
    "hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_events" (
    "id" UUID NOT NULL,
    "tradeTransactionId" UUID NOT NULL,
    "type" "WorkflowEventType" NOT NULL DEFAULT 'TRANSITION',
    "fromState" "TradeState",
    "toState" "TradeState" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "reason" TEXT,
    "correlationId" TEXT NOT NULL,
    "metadata" JSONB,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_events" (
    "id" UUID NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tradeId" UUID,
    "correlationId" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'CORE',
    "severity" "EventSeverity" NOT NULL DEFAULT 'INFO',
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dead_letter_events" (
    "id" UUID NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "failedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dead_letter_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "tradeId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT,
    "source" TEXT NOT NULL DEFAULT 'orchestrator',
    "beforeState" JSONB,
    "afterState" JSONB,
    "correlationId" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "tradeId" UUID,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'inApp',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "type" TEXT NOT NULL DEFAULT 'trade',
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_deletedAt_idx" ON "organizations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "buyers_organizationId_idx" ON "buyers"("organizationId");

-- CreateIndex
CREATE INDEX "buyers_deletedAt_idx" ON "buyers"("deletedAt");

-- CreateIndex
CREATE INDEX "suppliers_organizationId_idx" ON "suppliers"("organizationId");

-- CreateIndex
CREATE INDEX "suppliers_deletedAt_idx" ON "suppliers"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "trade_transactions_reference_key" ON "trade_transactions"("reference");

-- CreateIndex
CREATE INDEX "trade_transactions_organizationId_idx" ON "trade_transactions"("organizationId");

-- CreateIndex
CREATE INDEX "trade_transactions_currentState_idx" ON "trade_transactions"("currentState");

-- CreateIndex
CREATE INDEX "trade_transactions_buyerId_idx" ON "trade_transactions"("buyerId");

-- CreateIndex
CREATE INDEX "trade_transactions_supplierId_idx" ON "trade_transactions"("supplierId");

-- CreateIndex
CREATE INDEX "trade_transactions_deletedAt_idx" ON "trade_transactions"("deletedAt");

-- CreateIndex
CREATE INDEX "trade_transactions_correlationId_idx" ON "trade_transactions"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_tradeTransactionId_key" ON "rfqs"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "rfqs_organizationId_idx" ON "rfqs"("organizationId");

-- CreateIndex
CREATE INDEX "rfqs_deletedAt_idx" ON "rfqs"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "deals_tradeTransactionId_key" ON "deals"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "deals_organizationId_idx" ON "deals"("organizationId");

-- CreateIndex
CREATE INDEX "deals_deletedAt_idx" ON "deals"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tradeTransactionId_key" ON "orders"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "orders_organizationId_idx" ON "orders"("organizationId");

-- CreateIndex
CREATE INDEX "orders_deletedAt_idx" ON "orders"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "escrows_tradeTransactionId_key" ON "escrows"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "escrows_organizationId_idx" ON "escrows"("organizationId");

-- CreateIndex
CREATE INDEX "escrows_deletedAt_idx" ON "escrows"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tradeTransactionId_key" ON "payments"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "payments_organizationId_idx" ON "payments"("organizationId");

-- CreateIndex
CREATE INDEX "payments_deletedAt_idx" ON "payments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_tradeTransactionId_key" ON "shipments"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "shipments_organizationId_idx" ON "shipments"("organizationId");

-- CreateIndex
CREATE INDEX "shipments_deletedAt_idx" ON "shipments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "customs_declarations_tradeTransactionId_key" ON "customs_declarations"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "customs_declarations_organizationId_idx" ON "customs_declarations"("organizationId");

-- CreateIndex
CREATE INDEX "customs_declarations_deletedAt_idx" ON "customs_declarations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_tradeTransactionId_key" ON "settlements"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "settlements_organizationId_idx" ON "settlements"("organizationId");

-- CreateIndex
CREATE INDEX "settlements_deletedAt_idx" ON "settlements"("deletedAt");

-- CreateIndex
CREATE INDEX "documents_organizationId_idx" ON "documents"("organizationId");

-- CreateIndex
CREATE INDEX "documents_tradeTransactionId_idx" ON "documents"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "documents_deletedAt_idx" ON "documents"("deletedAt");

-- CreateIndex
CREATE INDEX "workflow_events_tradeTransactionId_idx" ON "workflow_events"("tradeTransactionId");

-- CreateIndex
CREATE INDEX "workflow_events_correlationId_idx" ON "workflow_events"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_events_tradeTransactionId_sequence_key" ON "workflow_events"("tradeTransactionId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "domain_events_eventId_key" ON "domain_events"("eventId");

-- CreateIndex
CREATE INDEX "domain_events_type_idx" ON "domain_events"("type");

-- CreateIndex
CREATE INDEX "domain_events_tradeId_idx" ON "domain_events"("tradeId");

-- CreateIndex
CREATE INDEX "domain_events_correlationId_idx" ON "domain_events"("correlationId");

-- CreateIndex
CREATE INDEX "dead_letter_events_eventId_idx" ON "dead_letter_events"("eventId");

-- CreateIndex
CREATE INDEX "dead_letter_events_recovered_idx" ON "dead_letter_events"("recovered");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "audit_logs_tradeId_idx" ON "audit_logs"("tradeId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_organizationId_idx" ON "notifications"("organizationId");

-- CreateIndex
CREATE INDEX "notifications_tradeId_idx" ON "notifications"("tradeId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_transactions" ADD CONSTRAINT "trade_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_transactions" ADD CONSTRAINT "trade_transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_transactions" ADD CONSTRAINT "trade_transactions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customs_declarations" ADD CONSTRAINT "customs_declarations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customs_declarations" ADD CONSTRAINT "customs_declarations_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_tradeTransactionId_fkey" FOREIGN KEY ("tradeTransactionId") REFERENCES "trade_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
