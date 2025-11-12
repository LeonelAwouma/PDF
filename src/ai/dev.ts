import { config } from 'dotenv';
config();

import '@/ai/flows/compare-pdf-quality.ts';
import '@/ai/flows/ocr-and-format.ts';
import '@/ai/flows/merge-pdf.ts';
import '@/ai/flows/split-pdf.ts';
