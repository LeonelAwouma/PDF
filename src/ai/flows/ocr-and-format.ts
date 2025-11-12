'use server';

/**
 * @fileOverview OCR and Format Flow - Extracts text from an image using OCR and converts it into an editable PDF format.
 *
 * @function ocrAndFormat - Main function to execute the OCR and formatting process.
 * @typedef {OcrAndFormatInput} OcrAndFormatInput - Input type for the ocrAndFormat function.
 * @typedef {OcrAndFormatOutput} OcrAndFormatOutput - Output type for the ocrAndFormat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as fs from 'fs';
import { Readable } from 'stream';
import { MediaPart } from 'genkit';

const OcrAndFormatInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type OcrAndFormatInput = z.infer<typeof OcrAndFormatInputSchema>;

const OcrAndFormatOutputSchema = z.object({
  editablePdfDataUri: z.string().describe('The extracted text in an editable PDF format as a data URI.'),
});

export type OcrAndFormatOutput = z.infer<typeof OcrAndFormatOutputSchema>;

export async function ocrAndFormat(input: OcrAndFormatInput): Promise<OcrAndFormatOutput> {
  return ocrAndFormatFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: OcrAndFormatInputSchema},
  output: {schema: z.string().describe('The extracted text from the image.')},
  prompt: `Extract the text from the following document image. Return only the raw text.\n\n{{media url=photoDataUri}}`,
});

const formatPrompt = ai.definePrompt({
  name: 'formatPrompt',
  input: {schema: z.string().describe('The extracted text to format.')},
  output: {schema: z.string().describe('The extracted text in markdown format.')},
  prompt: `You are a document formatting expert. Convert the following text into markdown format, ensure that it has a title, sections, and paragraphs.\n\nText: {{{$input}}}`,
});

const ocrAndFormatFlow = ai.defineFlow(
  {
    name: 'ocrAndFormatFlow',
    inputSchema: OcrAndFormatInputSchema,
    outputSchema: OcrAndFormatOutputSchema,
  },
  async input => {
    const {output: extractedText} = await ocrPrompt(input);
    const {output: formattedText} = await formatPrompt(extractedText!);

    // TODO: Use a PDF generation library to convert the markdown text into a PDF
    // For now, just return the formatted text as a data URI.
    const pdfDataUri = `data:text/plain;base64,${Buffer.from(formattedText!).toString('base64')}`;

    return {editablePdfDataUri: pdfDataUri};
  }
);
