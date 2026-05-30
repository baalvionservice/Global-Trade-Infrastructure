'use server';
/**
 * @fileOverview An AI-driven vendor and counterparty scoring flow.
 *
 * - aiVendorCounterpartyScoring - A function that handles the vendor and counterparty scoring process.
 * - AiVendorCounterpartyScoringInput - The input type for the aiVendorCounterpartyScoring function.
 * - AiVendorCounterpartyScoringOutput - The return type for the aiVendorCounterpartyScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiVendorCounterpartyScoringInputSchema = z.object({
  vendorName: z.string().describe('The name of the vendor or counterparty.'),
  tradeHistory: z
    .string()
    .describe('A summary of the trade history with the vendor or counterparty.'),
  financialData: z.string().describe('Relevant financial data of the vendor or counterparty.'),
  complianceRecords: z
    .string()
    .describe('A summary of the compliance records for the vendor or counterparty.'),
});
export type AiVendorCounterpartyScoringInput = z.infer<
  typeof AiVendorCounterpartyScoringInputSchema
>;

const AiVendorCounterpartyScoringOutputSchema = z.object({
  riskScore: z.number().describe('A risk score between 0 and 100, with higher scores indicating higher risk.'),
  riskAssessment: z
    .string()
    .describe('A detailed assessment of the risks associated with the vendor or counterparty.'),
  recommendations: z
    .string()
    .describe('Recommendations for mitigating the identified risks.'),
});
export type AiVendorCounterpartyScoringOutput = z.infer<
  typeof AiVendorCounterpartyScoringOutputSchema
>;

export async function aiVendorCounterpartyScoring(
  input: AiVendorCounterpartyScoringInput
): Promise<AiVendorCounterpartyScoringOutput> {
  return aiVendorCounterpartyScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiVendorCounterpartyScoringPrompt',
  input: {schema: AiVendorCounterpartyScoringInputSchema},
  output: {schema: AiVendorCounterpartyScoringOutputSchema},
  prompt: `You are an AI-powered risk assessment tool. Your task is to provide a risk score, risk assessment, and recommendations for vendors and counterparties based on the provided data.

Vendor/Counterparty Name: {{{vendorName}}}
Trade History: {{{tradeHistory}}}
Financial Data: {{{financialData}}}
Compliance Records: {{{complianceRecords}}}

Provide a risk score between 0 and 100, a detailed risk assessment, and actionable recommendations.
`,
});

const aiVendorCounterpartyScoringFlow = ai.defineFlow(
  {
    name: 'aiVendorCounterpartyScoringFlow',
    inputSchema: AiVendorCounterpartyScoringInputSchema,
    outputSchema: AiVendorCounterpartyScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
