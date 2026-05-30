
'use server';
/**
 * @fileOverview AI Contract Risk Analysis Agent.
 *
 * - analyzeContractRisk - Audits contract clauses for commercial and legal risk.
 * - AnalyzeContractInput - Full contract text or specific clauses.
 * - AnalyzeContractOutput - Risk scores and redline recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeContractInputSchema = z.object({
  contractId: z.string(),
  title: z.string(),
  clauses: z.array(z.object({
    id: z.string(),
    category: z.string(),
    content: z.string()
  })),
  jurisdiction: z.string().describe('The legal jurisdiction of the contract (e.g., Singapore Law).'),
});
export type AnalyzeContractInput = z.infer<typeof AnalyzeContractInputSchema>;

const AnalyzeContractOutputSchema = z.object({
  overallRiskScore: z.number().describe('Weighted risk score (0-100).'),
  clauseAudits: z.array(z.object({
    clauseId: z.string(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    finding: z.string(),
    recommendation: z.string().optional(),
  })),
  summary: z.string().describe('Executive gist of the legal exposure.'),
  missingProtections: z.array(z.string()).describe('Standard clauses that are missing.'),
});
export type AnalyzeContractOutput = z.infer<typeof AnalyzeContractOutputSchema>;

export async function analyzeContractRisk(
  input: AnalyzeContractInput
): Promise<AnalyzeContractOutput> {
  return analyzeContractRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeContractRiskPrompt',
  input: {schema: AnalyzeContractInputSchema},
  output: {schema: AnalyzeContractOutputSchema},
  prompt: `You are a Sovereign Legal Oracle for Baalvion Global. Analyze the following contract for institutional risk:

Contract: {{{title}}} (ID: {{{contractId}}})
Jurisdiction: {{{jurisdiction}}}

Clauses:
{{#each clauses}}
- [{{{category}}}] {{{content}}}
{{/each}}

Task:
1. Audit each clause against international trade law and jurisdictional standards.
2. Assign a risk level (LOW to CRITICAL).
3. Identify "Redlines" where the wording deviates from safe institutional baselines.
4. Detect missing protections like "Adjudication Finality" or "Force Majeure".

Ensure output is a valid JSON object matching the schema.`,
});

const analyzeContractRiskFlow = ai.defineFlow(
  {
    name: 'analyzeContractRiskFlow',
    inputSchema: AnalyzeContractInputSchema,
    outputSchema: AnalyzeContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
