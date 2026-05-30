# 🚀 Baalvion OS: Backend Production Handoff Guide

## 1. The Strategy
The frontend is built as a **High-Fidelity Deterministic Twin**. To move to production, replace the `MockDatabase` singleton with the **SGEK Execution Kernel** and **Kafka Event Mesh**.

## 2. Replacement Map
| Frontend Service | Production Requirement |
| :--- | :--- |
| `apiClient` | Route to NestJS API Gateway (Istio Ingress). |
| `mock-database.ts` | Map to PostgreSQL + ClickHouse + Redis. |
| `event-bus.ts` | Map to Kafka (Persistence) and NATS (Real-time). |
| `telemetry-service.ts` | Connect to production IoT MQTT streams. |

## 3. State Finality Protocol
Do NOT allow direct `UPDATE` queries on trade objects. Every change must be an `INSERT` into the `InstitutionalEventStore` followed by an asynchronous projection update. Use the `requestId` for Exactly-Once processing.

## 4. Multi-Tenancy Enforcement
The `tenant_id` MUST be extracted from the cryptographically signed JWT and forced into every database query. No cross-tenant data leak is acceptable at the compute or storage layer.

## 5. Deployment Guardrail
Production cutover requires the **Sovereign Readiness Score** to be >= 95%. Trigger audit via `AuditOrchestrator`.
