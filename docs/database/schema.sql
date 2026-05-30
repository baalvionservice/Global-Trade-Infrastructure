
-- PostgreSQL Database Schema for Baalvion Logistics Platform

-- Users and Institutional Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'sovereign_admin', 'bank_admin', 'enterprise_user', 'agent')),
    company_id UUID,
    kyc_status TEXT DEFAULT 'not_started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade RFQs
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    product_name TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC NOT NULL,
    unit TEXT,
    target_price NUMERIC,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'open',
    delivery_country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    carrier_id UUID,
    tracking_number TEXT,
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    status TEXT DEFAULT 'created',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance Policies
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id),
    coverage_type TEXT NOT NULL,
    insured_amount NUMERIC NOT NULL,
    premium_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests (Agents/Brokers)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    client_id UUID REFERENCES users(id),
    shipment_id UUID REFERENCES shipments(id),
    request_type TEXT NOT NULL,
    status TEXT DEFAULT 'requested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
