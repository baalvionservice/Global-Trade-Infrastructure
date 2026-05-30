# Baalvion Engineering Specification (v1.0)

## 1. System Architecture
The system follows a **Modular Monolith** core with **Decoupled Adapters** for integrations.
- **API Layer**: Next.js API Routes (Entry points, Auth, Validation).
- **Orchestration Layer**: SGEK (Execution Kernel enforcing GST Matrix).
- **Service Layer**: Pure business logic adapters for domain-specific events.
- **Repository Layer**: Event-sourced data access abstraction.
- **Database Layer**: PostgreSQL (SSOT) + Firestore (Real-time).

## 2. Core Service Breakdown

| Service | Responsibility | SSOT Entity |
| :--- | :--- | :--- |
| **Identity** | Authentication & RBAC/ABAC | Organization, User |
| **Trade** | RFQ, Quotation, Deal | TradeEvent |
| **Finance** | Escrow, Ledger, Payouts | LedgerEntry |
| **Logistics** | Shipments, Telemetry | MilestoneEvent |
| **Customs** | Clearance & Tariffs | CustomsEntry |

## 3. The Single Global Execution Kernel (SGEK)
Every state change MUST pass the following pipeline:
1.  **Security Check**: Identity + Permissions + Context.
2.  **Compliance Check**: Policy-as-Code (Sanctions, HS Codes).
3.  **GST Guard**: Validate transition against the Transition Matrix.
4.  **Atomic Commit**: Write to PostgreSQL `trade_events`.
5.  **State Projection**: Update relational views and Firestore.

## 4. Implementation Rules
- No business logic in UI components.
- No direct state mutation in the database.
- Idempotency keys are mandatory for all write operations.
