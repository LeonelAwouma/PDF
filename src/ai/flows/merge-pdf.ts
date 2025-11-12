'use server';

/**
 * @fileOverview A PDF merging AI agent.
 *
 * - mergePdf - A function that handles the PDF merging process.
 * - MergePdfInput - The input type for the mergePdf function.
 * - MergePdfOutput - The return type for the mergePdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument } from 'pdf-lib';

const MergePdfInputSchema = z.object({
  pdfDataUris: z.array(z.string()).describe(
    "An array of PDF documents as data URIs. Each data URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type MergePdfInput = z.infer<typeof MergePdfInputSchema>;

const MergePdfOutputSchema = z.object({
  mergedPdfDataUri: z.string().describe('The merged PDF document as a data URI.'),
});
export type MergePdfOutput = z.infer<typeof MergePdfOutputSchema>;

export async function mergePdf(input: MergePdfInput): Promise<MergePdfOutput> {
  return mergePdfFlow(input);
}

const mergePdfFlow = ai.defineFlow(
  {
    name: 'mergePdfFlow',
    inputSchema: MergePdfInputSchema,
    outputSchema: MergePdfOutputSchema,
  },
  async ({ pdfDataUris }) => {
    const mergedPdf = await PDFDocument.create();

    for (const pdfDataUri of pdfDataUris) {
      const pdfBytes = Buffer.from(pdfDataUri.split(',')[1], 'base64');
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfDataUri = `data:application/pdf;base64,${Buffer.from(mergedPdfBytes).toString('base64')}`;

    return { mergedPdfDataUri };
  }
);
