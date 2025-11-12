'use server';

/**
 * @fileOverview A PDF compression AI agent. (Now client-side)
 *
 * - compressPdf - A function that handles the PDF compression process.
 * - CompressPdfInput - The input type for the compressPdf function.
 * - CompressPdfOutput - The return type for the compressPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompressPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document to compress, as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  compressionLevel: z.enum(['low', 'medium', 'high']).describe('The desired compression level.'),
});
export type CompressPdfInput = z.infer<typeof CompressPdfInputSchema>;

const CompressPdfOutputSchema = z.object({
  compressedPdfDataUri: z.string().describe('The compressed PDF document as a data URI.'),
  originalSize: z.number().describe('The original size of the PDF in bytes.'),
  compressedSize: z.number().describe('The compressed size of the PDF in bytes.'),
});
export type CompressPdfOutput = z.infer<typeof CompressPdfOutputSchema>;

// This flow is no longer used by the front-end but is kept for reference
// or potential future server-side processing needs.
const compressPdfFlow = ai.defineFlow(
  {
    name: 'compressPdfFlow',
    inputSchema: CompressPdfInputSchema,
    outputSchema: CompressPdfOutputSchema,
  },
  async ({ pdfDataUri }) => {
    // This server-side flow is disabled in favor of client-side compression.
    // It returns the original file to avoid errors if called.
    const originalBuffer = Buffer.from(pdfDataUri.split(',')[1], 'base64');
    
    return {
      compressedPdfDataUri: pdfDataUri,
      originalSize: originalBuffer.length,
      compressedSize: originalBuffer.length,
    };
  }
);

// The exported function is now a placeholder.
export async function compressPdf(input: CompressPdfInput): Promise<CompressPdfOutput> {
  return compressPdfFlow(input);
}
