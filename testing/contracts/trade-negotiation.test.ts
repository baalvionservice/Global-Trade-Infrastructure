
/**
 * @file trade-negotiation.test.ts
 * @description Distributed Contract Testing (Consumer-Driven).
 * Ensures protocol compatibility between the Negotiation and Treasury nodes.
 */

import { describe, it, expect } from 'vitest';
import { PactV3, Matchers } from '@pact-foundation/pact';
import path from 'path';

const provider = new PactV3({
  consumer: 'NegotiationService',
  provider: 'TreasuryService',
  dir: path.resolve(process.cwd(), 'testing/contracts/pacts'),
});

describe('Negotiation <-> Treasury Contract Finality', () => {
  it('should authorize escrow provisioning upon negotiation handshake', async () => {
    provider
      .given('a finalized deal room state')
      .uponReceiving('a request to provision institutional escrow')
      .withRequest({
        method: 'POST',
        path: '/api/v1/escrows',
        headers: { 'Content-Type': 'application/json' },
        body: {
          orderId: Matchers.regex(/^ORD-[0-9A-Z]+$/, 'ORD-9921'),
          amount: Matchers.decimal(350000),
          currency: Matchers.regex(/^[A-Z]{3}$/, 'USD'),
          buyerId: Matchers.like('COMP-101'),
          sellerId: Matchers.like('COMP-102'),
        },
      })
      .willRespondWith({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: Matchers.like('ESC-5002'),
          status: Matchers.term({ generate: 'created', matcher: 'created|funded' }),
          complianceSignature: Matchers.like('sha256_0x...'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/api/v1/escrows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: 'ORD-9921', 
          amount: 350000, 
          currency: 'USD',
          buyerId: 'COMP-101',
          sellerId: 'COMP-102'
        }),
      });
      
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.data.status).toBe('created');
    });
  });
});
