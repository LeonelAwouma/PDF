'use server';

/**
 * @fileOverview A PDF splitting AI agent.
 *
 * - splitPdf - A function that handles the PDF splitting process.
 * - SplitPdfInput - The input type for the splitPdf function.
 * - SplitPdfOutput - The return type for the splitPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument } from 'pdf-lib';

const SplitPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document to split, as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  ranges: z
    .string()
    .describe(
      'A comma-separated string of page numbers and ranges (e.g., "1,3,5-8").'
    ),
});
export type SplitPdfInput = z.infer<typeof SplitPdfInputSchema>;

const SplitPdfOutputSchema = z.object({
  splitPdfDataUri: z
    .string()
    .describe('The new PDF document containing the extracted pages as a data URI.'),
  pageCount: z.number().describe('The number of pages in the resulting PDF.'),
});
export type SplitPdfOutput = z.infer<typeof SplitPdfOutputSchema>;

export async function splitPdf(input: SplitPdfInput): Promise<SplitPdfOutput> {
  return splitPdfFlow(input);
}

// Helper function to parse page ranges
function parsePageRanges(ranges: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = ranges.split(',');

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart.includes('-')) {
      const [start, end] = trimmedPart.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          pages.add(i - 1); // pdf-lib is 0-indexed
        }
      }
    } else {
      const page = Number(trimmedPart);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        pages.add(page - 1); // pdf-lib is 0-indexed
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}


const splitPdfFlow = ai.defineFlow(
  {
    name: 'splitPdfFlow',
    inputSchema: SplitPdfInputSchema,
    outputSchema: SplitPdfOutputSchema,
  },
  async ({ pdfDataUri, ranges }) => {
    const pdfBytes = Buffer.from(pdfDataUri.split(',')[1], 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const totalPages = pdfDoc.getPageCount();
    const pageIndicesToCopy = parsePageRanges(ranges, totalPages);

    if (pageIndicesToCopy.length === 0) {
      throw new Error("No valid pages selected. Please check your page ranges.");
    }

    const newPdfDoc = await PDFDocument.create();
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndicesToCopy);
    copiedPages.forEach((page) => newPdfDoc.addPage(page));

    const newPdfBytes = await newPdfDoc.save();
    const newPdfDataUri = `data:application/pdf;base64,${Buffer.from(
      newPdfBytes
    ).toString('base64')}`;

    return { 
        splitPdfDataUri: newPdfDataUri,
        pageCount: newPdfDoc.getPageCount(),
    };
  }
);
