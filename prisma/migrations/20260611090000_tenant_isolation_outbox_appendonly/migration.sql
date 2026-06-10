-- Production-readiness remediation: CR-7 tenant isolation / RLS, CR-6 outbox,
-- CR-14 append-only event & audit store.

-- WorkflowEvent.organizationId (NOT NULL, backfilled from parent trade)
ALTER TABLE "workflow_events" ADD COLUMN "organizationId" UUID;
UPDATE "workflow_events" we
   SET "organizationId" = tt."organizationId"
  FROM "trade_transactions" tt
 WHERE tt."id" = we."tradeTransactionId" AND we."organizationId" IS NULL;
ALTER TABLE "workflow_events" ALTER COLUMN "organizationId" SET NOT NULL;
CREATE INDEX "workflow_events_organizationId_idx" ON "workflow_events"("organizationId");

-- DomainEvent.organizationId (nullable: global / non-tenant events allowed)
ALTER TABLE "domain_events" ADD COLUMN "organizationId" UUID;
CREATE INDEX "domain_events_organizationId_idx" ON "domain_events"("organizationId");

-- AuditLog.organizationId -> NOT NULL with a cascading FK
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_organizationId_fkey";
DELETE FROM "audit_logs" WHERE "organizationId" IS NULL;
ALTER TABLE "audit_logs" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Transactional outbox (CR-6)
CREATE TABLE "outbox_events" (
  "id"             UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "tradeId"        UUID,
  "eventType"      TEXT NOT NULL,
  "payload"        JSONB NOT NULL,
  "correlationId"  TEXT NOT NULL,
  "status"         TEXT NOT NULL DEFAULT 'PENDING',
  "sequence"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt"    TIMESTAMP(3),
  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "outbox_events_status_idx" ON "outbox_events"("status");
CREATE INDEX "outbox_events_organizationId_idx" ON "outbox_events"("organizationId");
CREATE INDEX "outbox_events_tradeId_idx" ON "outbox_events"("tradeId");

-- Least-privilege application role for RLS enforcement
DO $role$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'baalvion_app') THEN
    CREATE ROLE baalvion_app NOLOGIN;
  END IF;
END
$role$;

GRANT USAGE ON SCHEMA public TO baalvion_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO baalvion_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO baalvion_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO baalvion_app;

-- FORCE Row-Level Security + tenant policy on every tenant-scoped table
DO $rls$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'trade_transactions','rfqs','deals','orders','escrows','payments','shipments',
    'customs_declarations','settlements','documents','notifications','audit_logs',
    'risk_assessments','compliance_checks','trade_finance_instruments','financing_requests',
    'buyers','suppliers','users','workflow_events','outbox_events'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($pol$
      CREATE POLICY tenant_isolation ON %I
        USING (
          current_setting('app.current_tenant', true) IS NOT NULL
          AND current_setting('app.current_tenant', true) <> ''
          AND "organizationId" = current_setting('app.current_tenant', true)::uuid
        )
        WITH CHECK (
          current_setting('app.current_tenant', true) IS NOT NULL
          AND current_setting('app.current_tenant', true) <> ''
          AND "organizationId" = current_setting('app.current_tenant', true)::uuid
        )
    $pol$, t);
  END LOOP;
END
$rls$;

-- domain_events permits NULL-org (platform / global) events alongside tenant rows.
ALTER TABLE "domain_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "domain_events" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "domain_events"
  USING (
    "organizationId" IS NULL
    OR (
      current_setting('app.current_tenant', true) IS NOT NULL
      AND current_setting('app.current_tenant', true) <> ''
      AND "organizationId" = current_setting('app.current_tenant', true)::uuid
    )
  );

-- Append-only enforcement on the immutable event & audit stores (CR-14)
CREATE OR REPLACE FUNCTION enforce_append_only() RETURNS trigger AS $aof$
BEGIN
  RAISE EXCEPTION 'append-only: % on % is not permitted', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'check_violation';
END
$aof$ LANGUAGE plpgsql;

CREATE TRIGGER domain_events_no_mutate
  BEFORE UPDATE OR DELETE ON "domain_events"
  FOR EACH ROW EXECUTE FUNCTION enforce_append_only();

CREATE TRIGGER workflow_events_no_mutate
  BEFORE UPDATE OR DELETE ON "workflow_events"
  FOR EACH ROW EXECUTE FUNCTION enforce_append_only();

CREATE TRIGGER audit_logs_no_mutate
  BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION enforce_append_only();
