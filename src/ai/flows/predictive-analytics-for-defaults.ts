'use server';
/**
 * @fileOverview An AI agent for predictive analytics of trade defaults.
 *
 * - getTradeDefaultRisk - A function that analyzes trade data and predicts the risk of default or disruption.
 * - GetTradeDefaultRiskInput - The input type for the getTradeDefaultRisk function.
 * - GetTradeDefaultRiskOutput - The return type for the getTradeDefaultRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetTradeDefaultRiskInputSchema = z.object({
  tradeData: z
    .string()
    .describe(
      'A comprehensive JSON string containing all available data about the trade, including parties involved, financial instruments, goods being traded, logistics information, and regulatory status.'
    ),
  marketConditions: z
    .string()
    .describe(
      'A JSON string describing current market conditions, including currency exchange rates, commodity prices, and geopolitical factors.'
    ),
});
export type GetTradeDefaultRiskInput = z.infer<typeof GetTradeDefaultRiskInputSchema>;

const GetTradeDefaultRiskOutputSchema = z.object({
  riskScore: z
    .number()
    .describe(
      'A numerical score between 0 and 1 indicating the overall risk of default or disruption, with higher scores indicating higher risk.'
    ),
  riskFactors: z
    .array(z.string())
    .describe(
      'An array of strings, each describing a specific factor contributing to the risk score, such as vendor reputation, market volatility, or regulatory concerns.'
    ),
  recommendations: z
    .array(z.string())
    .describe(
      'An array of strings, each providing a recommendation for mitigating the identified risks, such as securing additional collateral, obtaining insurance, or delaying the trade.'
    ),
});
export type GetTradeDefaultRiskOutput = z.infer<typeof GetTradeDefaultRiskOutputSchema>;

export async function getTradeDefaultRisk(input: GetTradeDefaultRiskInput): Promise<GetTradeDefaultRiskOutput> {
  return getTradeDefaultRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getTradeDefaultRiskPrompt',
  input: {schema: GetTradeDefaultRiskInputSchema},
  output: {schema: GetTradeDefaultRiskOutputSchema},
  prompt: `You are an AI-powered risk assessment system for international trade. Your task is to analyze trade data and market conditions to predict the risk of default or disruption and provide recommendations for mitigation.

Analyze the following trade data:
{{{tradeData}}}

Consider these current market conditions:
{{{marketConditions}}}

Based on your analysis, provide a risk score (0-1), identify the key risk factors, and offer actionable recommendations.

Output: {{{{output}}}}`,
});

const getTradeDefaultRiskFlow = ai.defineFlow(
  {
    name: 'getTradeDefaultRiskFlow',
    inputSchema: GetTradeDefaultRiskInputSchema,
    outputSchema: GetTradeDefaultRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
