'use server';

/**
 * @fileOverview A PDF quality comparison AI agent.
 *
 * - comparePdfQuality - A function that handles the PDF comparison process.
 * - ComparePdfQualityInput - The input type for the comparePdfQuality function.
 * - ComparePdfQualityOutput - The return type for the comparePdfQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComparePdfQualityInputSchema = z.object({
  pdf1DataUri: z
    .string()
    .describe(
      "The first PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  pdf2DataUri: z
    .string()
    .describe(
      "The second PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ComparePdfQualityInput = z.infer<typeof ComparePdfQualityInputSchema>;

const ComparePdfQualityOutputSchema = z.object({
  summary: z.string().describe('A summary of which PDF document has higher quality and what information is missing from each.'),
});
export type ComparePdfQualityOutput = z.infer<typeof ComparePdfQualityOutputSchema>;

export async function comparePdfQuality(input: ComparePdfQualityInput): Promise<ComparePdfQualityOutput> {
  return comparePdfQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePdfQualityPrompt',
  input: {schema: ComparePdfQualityInputSchema},
  output: {schema: ComparePdfQualityOutputSchema},
  prompt: `You are an expert in comparing the quality of two PDF documents.

You will receive two PDF documents. Your task is to compare them and provide a summary of which PDF document has higher quality and what information is missing from each.

Here is the first PDF document:
{{media url=pdf1DataUri}}

Here is the second PDF document:
{{media url=pdf2DataUri}}`,
});

const comparePdfQualityFlow = ai.defineFlow(
  {
    name: 'comparePdfQualityFlow',
    inputSchema: ComparePdfQualityInputSchema,
    outputSchema: ComparePdfQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
