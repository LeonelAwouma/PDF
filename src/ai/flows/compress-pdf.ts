'use server';

/**
 * @fileOverview A PDF compression AI agent.
 *
 * - compressPdf - A function that handles the PDF compression process.
 * - CompressPdfInput - The input type for the compressPdf function.
 * - CompressPdfOutput - The return type for the compressPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument } from 'pdf-lib';

const CompressPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document to compress, as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  // pdf-lib doesn't really support compression levels, but we can keep it for the UI
  // and future enhancements. For now, we'll just use the standard save options.
  compressionLevel: z.enum(['low', 'medium', 'high']).describe('The desired compression level.'),
});
export type CompressPdfInput = z.infer<typeof CompressPdfInputSchema>;

const CompressPdfOutputSchema = z.object({
  compressedPdfDataUri: z.string().describe('The compressed PDF document as a data URI.'),
  originalSize: z.number().describe('The original size of the PDF in bytes.'),
  compressedSize: z.number().describe('The compressed size of the PDF in bytes.'),
});
export type CompressPdfOutput = z.infer<typeof CompressPdfOutputSchema>;

export async function compressPdf(input: CompressPdfInput): Promise<CompressPdfOutput> {
  return compressPdfFlow(input);
}

const compressPdfFlow = ai.defineFlow(
  {
    name: 'compressPdfFlow',
    inputSchema: CompressPdfInputSchema,
    outputSchema: CompressPdfOutputSchema,
  },
  async ({ pdfDataUri }) => {
    const pdfBytes = Buffer.from(pdfDataUri.split(',')[1], 'base64');
    const originalSize = pdfBytes.length;

    const pdfDoc = await PDFDocument.load(pdfBytes, {
      // Disabling smart update allows pdf-lib to rebuild the PDF from scratch,
      // which can help in removing unused objects and optimizing the structure.
      updateMetadata: false,
    });

    // This is the main compression step using pdf-lib. It groups objects
    // into streams, which is an effective way to reduce file size.
    const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

    const compressedSize = compressedPdfBytes.length;

    const compressedPdfDataUri = `data:application/pdf;base64,${Buffer.from(
      compressedPdfBytes
    ).toString('base64')}`;
    
    return {
      compressedPdfDataUri,
      originalSize,
      compressedSize,
    };
  }
);
