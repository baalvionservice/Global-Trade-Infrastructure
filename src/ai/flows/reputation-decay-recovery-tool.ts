'use server';
/**
 * @fileOverview Simulates reputation decay and recovery for vendors based on incidents.
 *
 * - simulateReputationChange - A function that simulates the reputation change process.
 * - SimulateReputationChangeInput - The input type for the simulateReputationChange function.
 * - SimulateReputationChangeOutput - The return type for the simulateReputationChange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateReputationChangeInputSchema = z.object({
  initialReputationScore: z.number().describe('The initial reputation score of the vendor (0-100).'),
  incidents: z.array(
    z.object({
      type: z.string().describe('The type of incident (e.g., compliance violation, shipment delay, negative news).'),
      severity: z.number().describe('The severity of the incident (1-10, where 10 is most severe).'),
    })
  ).describe('An array of incidents that affect the vendor reputation.'),
  recoveryActions: z.array(
    z.object({
      type: z.string().describe('The type of recovery action (e.g., process improvement, compensation, public apology).'),
      effectiveness: z.number().describe('The effectiveness of the recovery action (1-10, where 10 is most effective).'),
    })
  ).describe('An array of recovery actions taken by the vendor.'),
  simulationDuration: z.number().describe('The duration of the simulation in months.'),
});
export type SimulateReputationChangeInput = z.infer<typeof SimulateReputationChangeInputSchema>;

const SimulateReputationChangeOutputSchema = z.object({
  finalReputationScore: z.number().describe('The final reputation score of the vendor after the simulation.'),
  reputationTrend: z.array(
    z.object({
      month: z.number().describe('The month of the simulation.'),
      score: z.number().describe('The reputation score for that month.'),
    })
  ).describe('The reputation trend over the simulation duration.'),
  summary: z.string().describe('A summary of the simulation, including key incidents and recovery actions.'),
});
export type SimulateReputationChangeOutput = z.infer<typeof SimulateReputationChangeOutputSchema>;

export async function simulateReputationChange(input: SimulateReputationChangeInput): Promise<SimulateReputationChangeOutput> {
  return simulateReputationChangeFlow(input);
}

const reputationChangePrompt = ai.definePrompt({
  name: 'reputationChangePrompt',
  input: {schema: SimulateReputationChangeInputSchema},
  output: {schema: SimulateReputationChangeOutputSchema},
  prompt: `You are an AI expert in vendor risk management and reputation analysis. Given the vendor's initial reputation score, incidents, recovery actions, and simulation duration, simulate the reputation decay and recovery process.  Provide the final reputation score, reputation trend over time, and a summary of the simulation.

Initial Reputation Score: {{{initialReputationScore}}}
Incidents: {{#each incidents}}{{{type}}} (Severity: {{{severity}}}) {{/each}}
Recovery Actions: {{#each recoveryActions}}{{{type}}} (Effectiveness: {{{effectiveness}}}) {{/each}}
Simulation Duration: {{{simulationDuration}}} months

Consider the following factors when simulating reputation change:
* Incidents will negatively impact the reputation score, with more severe incidents causing a larger drop.
* Recovery actions will positively impact the reputation score, with more effective actions leading to a greater increase.
* The reputation score cannot exceed 100 or fall below 0.
* Provide the reputation trend on a month-by-month basis.
* Ensure the final reputation score, reputation trend, and summary are consistent.
`,
});

const simulateReputationChangeFlow = ai.defineFlow(
  {
    name: 'simulateReputationChangeFlow',
    inputSchema: SimulateReputationChangeInputSchema,
    outputSchema: SimulateReputationChangeOutputSchema,
  },
  async input => {
    const {output} = await reputationChangePrompt(input);
    return output!;
  }
);
