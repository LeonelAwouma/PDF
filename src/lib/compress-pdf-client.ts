// src/lib/compress-pdf-client.ts
import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'low' | 'medium' | 'high';

interface CompressResult {
  originalSize: number;
  compressedSize: number;
  compressedPdfDataUri: string;
}

export async function compressPdfClient(
  file: File,
  level: CompressionLevel,
  onProgress?: (percent: number) => void
): Promise<CompressResult> {
  const originalSize = file.size;

  // Étape 1 : Charger le PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  onProgress?.(20);

  // Étape 2 : Supprimer les métadonnées
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  pdfDoc.setCreationDate(undefined);
  pdfDoc.setModificationDate(undefined);
  onProgress?.(30);

  // Étape 3 : Paramètres de compression (non utilisé directement pour les images ici)
  const qualityMap = {
    low: 0.8,
    medium: 0.5,
    high: 0.2,
  };
  const quality = qualityMap[level];

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const newDoc = await PDFDocument.create();

  // Étape 4 : Traiter chaque page
  for (let i = 0; i < totalPages; i++) {
    const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
    newDoc.addPage(copiedPage);
    onProgress?.(30 + Math.round(((i + 1) / totalPages) * 55));
  }
  
  onProgress?.(85);

  // Étape 5 : Sauvegarder avec compression des flux d'objets
  const pdfBytes = await newDoc.save({
    useObjectStreams: true,
  });

  onProgress?.(100);

  const compressedSize = pdfBytes.byteLength;
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const compressedPdfDataUri = URL.createObjectURL(blob);

  return {
    originalSize,
    compressedSize,
    compressedPdfDataUri,
  };
}
