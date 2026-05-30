'use server';

/**
 * @fileOverview AI-powered delay prediction flow for global trade corridors.
 *
 * - predictCorridorDelay - Analyzes multi-factor data to forecast transit variances.
 * - PredictCorridorDelayInput - Input including route health, congestion, and risks.
 * - PredictCorridorDelayOutput - Predicted delay hours, confidence, and reasoning.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCorridorDelayInputSchema = z.object({
  routeName: z.string().describe('The name of the trade corridor.'),
  originNode: z.string(),
  destinationNode: z.string(),
  currentCongestionLevel: z.number().describe('0-100 scale of node load.'),
  portDelays: z.array(z.object({
    portId: z.string(),
    delayHours: z.number(),
    trend: z.string()
  })),
  activeRisks: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    description: z.string()
  })),
});
export type PredictCorridorDelayInput = z.infer<typeof PredictCorridorDelayInputSchema>;

const PredictCorridorDelayOutputSchema = z.object({
  predictedDelayHours: z.number().describe('The total estimated delay in hours beyond baseline.'),
  confidenceScore: z.number().describe('Probability of accuracy (0-1).'),
  riskImpact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  summary: z.string().describe('Qualitative analysis of the prediction.'),
  recommendation: z.string().optional()
});
export type PredictCorridorDelayOutput = z.infer<typeof PredictCorridorDelayOutputSchema>;

export async function predictCorridorDelay(input: PredictCorridorDelayInput): Promise<PredictCorridorDelayOutput> {
  return predictCorridorDelayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCorridorDelayPrompt',
  input: {schema: PredictCorridorDelayInputSchema},
  output: {schema: PredictCorridorDelayOutputSchema},
  prompt: `You are an AI maritime intelligence officer. Analyze the following telemetry for the trade corridor: {{{routeName}}}.

Nodes: {{{originNode}}} to {{{destinationNode}}}
Congestion: {{{currentCongestionLevel}}}%
Port Status: {{#each portDelays}}{{{portId}}} is at +{{{delayHours}}}h (Trend: {{{trend}}}) {{/each}}
Risk Signals: {{#each activeRisks}}{{{type}}} - {{{severity}}}: {{{description}}} {{/each}}

Calculate the most probable delay hours beyond the baseline transit time. 
Consider that an 'increasing' trend in port delay usually compounds, and 'CRITICAL' risks may require rerouting, adding significant time.

Output a structured prediction with a summary explaining the "Chain of Logic" used.`,
});

const predictCorridorDelayFlow = ai.defineFlow(
  {
    name: 'predictCorridorDelayFlow',
    inputSchema: PredictCorridorDelayInputSchema,
    outputSchema: PredictCorridorDelayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
