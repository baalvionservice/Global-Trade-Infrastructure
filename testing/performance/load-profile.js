
/**
 * @file load-profile.js
 * @description K6 Hyperscale Load Model.
 * Simulates planetary-scale trade velocity across regional clusters.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },  // Ramp-up to 200 institutional nodes
    { duration: '3m', target: 500 },  // Sustained high-authority traffic
    { duration: '1m', target: 0 },    // Graceful scale-down
  ],
  thresholds: {
    'http_req_duration': ['p(99)<450'], // 99% of handshakes must finalize < 450ms
    'http_req_failed': ['rate<0.0001'], // 99.99% success rate required for mission-criticality
    'checks': ['rate>0.99'],           // Assertions must pass 99%+
  },
};

export default function () {
  const BASE_URL = __ENV.API_URL || 'http://localhost:9002';
  
  // 1. Transaction Handshake Simulation (RFQ Discovery)
  const rfqRes = http.get(`${BASE_URL}/api/v1/rfqs`);
  check(rfqRes, {
    'rfq_ledger_sync': (r) => r.status === 200,
    'latency_compliance': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // 2. High-Authority Telemetry Pulse
  const telemetryPayload = JSON.stringify({
    metric: 'NODE_PULSE',
    value: Math.random() * 100,
    unit: 'PERC',
    nodeId: 'LOAD_GEN_01',
    tags: ['PERF_TEST']
  });

  const telRes = http.post(`${BASE_URL}/api/v1/telemetry_points`, telemetryPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(telRes, {
    'telemetry_ingested': (r) => r.status === 201,
  });

  sleep(1);
}
