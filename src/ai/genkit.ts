// Hard server boundary: importing this module (and therefore the entire Genkit + OpenTelemetry
// runtime) from any client component fails the build instead of silently shipping AI/telemetry
// code to the browser. AI logic is reachable only through `'use server'` flows and route handlers.
import 'server-only';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @file genkit.ts
 * @description AI Singularity Configuration.
 * Stabilized legacy plugin fallback for production resolution consistency.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-pro',
});
