'use server';

/**
 * @fileOverview This file implements the Genkit flow for providing AI-driven risk alerts for trade corridors.
 *
 * - aiRiskAlertsForTradeCorridors - A function that returns AI-driven risk alerts for specified trade corridors or geopolitical events.
 * - AiRiskAlertsForTradeCorridorsInput - The input type for the aiRiskAlertsForTradeCorridors function.
 * - AiRiskAlertsForTradeCorridorsOutput - The return type for the aiRiskAlertsForTradeCorridors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiRiskAlertsForTradeCorridorsInputSchema = z.object({
  tradeCorridor: z.string().describe('The trade corridor to analyze (e.g., US-China, EU-Africa).'),
  geopoliticalEvent: z
    .string()
    .optional()
    .describe('An optional geopolitical event to consider (e.g., Ukraine war, new sanctions).'),
});
export type AiRiskAlertsForTradeCorridorsInput = z.infer<typeof AiRiskAlertsForTradeCorridorsInputSchema>;

const AiRiskAlertsForTradeCorridorsOutputSchema = z.object({
  riskLevel: z
    .enum(['LOW', 'MEDIUM', 'HIGH'])
    .describe('The overall risk level for the specified trade corridor.'),
  riskFactors: z
    .array(z.string())
    .describe('A list of risk factors contributing to the overall risk level.'),
  recommendations: z
    .array(z.string())
    .describe('Recommendations for mitigating the identified risks.'),
});
export type AiRiskAlertsForTradeCorridorsOutput = z.infer<typeof AiRiskAlertsForTradeCorridorsOutputSchema>;

export async function aiRiskAlertsForTradeCorridors(
  input: AiRiskAlertsForTradeCorridorsInput
): Promise<AiRiskAlertsForTradeCorridorsOutput> {
  return aiRiskAlertsForTradeCorridorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRiskAlertsForTradeCorridorsPrompt',
  input: {schema: AiRiskAlertsForTradeCorridorsInputSchema},
  output: {schema: AiRiskAlertsForTradeCorridorsOutputSchema},
  prompt: `You are an AI-powered risk assessment tool for global trade.  Analyze the risk factors associated with the following trade corridor and geopolitical event (if any), and provide a risk assessment.

Trade Corridor: {{{tradeCorridor}}}
Geopolitical Event: {{{geopoliticalEvent}}}

Consider factors such as economic stability, political risks, regulatory changes, and security concerns.

Output a JSON object with the following fields:
- riskLevel:  Overall risk level (LOW, MEDIUM, HIGH).
- riskFactors: A list of risk factors contributing to the risk level.
- recommendations: Recommendations for mitigating the identified risks.

Ensure the output is valid JSON that conforms to the schema.`,
});

const aiRiskAlertsForTradeCorridorsFlow = ai.defineFlow(
  {
    name: 'aiRiskAlertsForTradeCorridorsFlow',
    inputSchema: AiRiskAlertsForTradeCorridorsInputSchema,
    outputSchema: AiRiskAlertsForTradeCorridorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

