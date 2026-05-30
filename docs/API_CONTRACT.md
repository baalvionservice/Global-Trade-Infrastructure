# Baalvion REST API Contract (v1)

## 1. General Specification
- **Base URL**: `/api/v1`
- **Response Type**: `application/json`
- **Auth**: Bearer Institutional Token (JWT)

## 2. Standard Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 1, "version": 42 },
  "timestamp": "2024-05-15T10:00:00Z"
}
```

## 3. Core Endpoints
### `POST /events`
The universal entry point for state transitions.
- **Body**: `{ "aggregateId": "UUID", "action": "ACCEPT_QUOTE", "requestId": "UUID", "version": 42 }`

### `GET /registry/{entity}`
Reads current snapshots from the Materialized View layer.
- **Supports**: `rfqs`, `deals`, `orders`, `shipments`, `payments`.
