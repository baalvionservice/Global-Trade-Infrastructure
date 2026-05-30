'use server';
/**
 * @fileOverview AI Negotiation Assistant for institutional trade handshakes.
 *
 * - aiNegotiationAssistant - Recommends pricing strategies and predicts success probability.
 * - AiNegotiationInput - Current bid, counterparty trust, and market data.
 * - AiNegotiationOutput - Probability score and suggested counter-offer logic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNegotiationInputSchema = z.object({
  dealId: z.string(),
  productName: z.string(),
  currentPrice: z.number(),
  targetPrice: z.number(),
  counterpartyTrustScore: z.number(),
  marketBaselinePrice: z.number(),
  negotiationHistory: z.string().describe('Summary of previous counter-offers in this room.'),
});
export type AiNegotiationInput = z.infer<typeof AiNegotiationInputSchema>;

const AiNegotiationOutputSchema = z.object({
  successProbability: z.number().describe('Probability of deal finality (0-1).'),
  suggestedAction: z.enum(['ACCEPT', 'COUNTER', 'REJECT', 'ESCALATE']),
  recommendedPrice: z.number().optional(),
  reasoningTrace: z.array(z.string()).describe('The logic used by the AI to reach this decision.'),
  riskAdjustment: z.string().describe('How the counterparty risk influenced the recommendation.'),
});
export type AiNegotiationOutput = z.infer<typeof AiNegotiationOutputSchema>;

export async function aiNegotiationAssistant(
  input: AiNegotiationInput
): Promise<AiNegotiationOutput> {
  return aiNegotiationAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiNegotiationAssistantPrompt',
  input: {schema: AiNegotiationInputSchema},
  output: {schema: AiNegotiationOutputSchema},
  prompt: `You are an AI trade strategist for Baalvion Global. Analyze the following negotiation context:

Product: {{{productName}}} (Deal ID: {{{dealId}}})
Current Offered Price: {{{currentPrice}}}
Buyer's Target Price: {{{targetPrice}}}
Market Baseline: {{{marketBaselinePrice}}}
Counterparty Trust Score: {{{counterpartyTrustScore}}}/1000

Negotiation History:
{{{negotiationHistory}}}

Task:
1. Calculate the success probability of reaching a handshake at the current price.
2. Recommend the next strategic move (ACCEPT, COUNTER, REJECT, or ESCALATE).
3. If countering, suggest a price that maximizes margin while maintaining 80%+ closure probability.
4. Provide a reasoning trace explaining how you balanced market data vs. counterparty risk.

Ensure output is a valid JSON object matching the schema.`,
});

const aiNegotiationAssistantFlow = ai.defineFlow(
  {
    name: 'aiNegotiationAssistantFlow',
    inputSchema: AiNegotiationInputSchema,
    outputSchema: AiNegotiationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
