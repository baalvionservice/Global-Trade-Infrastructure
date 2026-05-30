# Baalvion Global Trade: PostgreSQL Schema Design

## 1. The Event Store (System of Truth)
```sql
CREATE TABLE trade_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(50) NOT NULL, -- RFQ, DEAL, ORDER, etc.
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    version INT NOT NULL,
    tenant_id UUID NOT NULL,
    triggered_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_aggregate ON trade_events(aggregate_id, version);
```

## 2. Materialized Views (System of Record)
```sql
-- Snapshots reconstructed from events for fast UI reads
CREATE TABLE deals (
    id UUID PRIMARY KEY,
    status trade_status NOT NULL,
    current_price NUMERIC(18,2),
    current_quantity NUMERIC(18,4),
    buyer_id UUID,
    seller_id UUID,
    version INT,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## 3. Static Entity Registries
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type org_type NOT NULL,
    country VARCHAR(100),
    trust_score INT DEFAULT 500,
    verification_level INT DEFAULT 0,
    tenant_id UUID UNIQUE
);
```
