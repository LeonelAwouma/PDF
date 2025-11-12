// src/lib/compress-pdf-client.ts
import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'low' | 'medium' | 'high';

export interface CompressResult {
  originalSize: number;
  compressedSize: number;
  compressedPdfBlobUrl: string;
}

export async function compressPdfClient(
  file: File,
  level: CompressionLevel, // level is not used in this version but kept for interface consistency
  onProgress?: (percent: number) => void
): Promise<CompressResult> {
  const originalSize = file.size;
  onProgress?.(10);

  // 1. Charger le PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  onProgress?.(30);

  // 2. Supprimer toutes les métadonnées
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  
  onProgress?.(60);

  // 4. Sauvegarder avec optimisation maximale
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,     // Réduit la redondance
  });

  onProgress?.(90);

  const compressedSize = pdfBytes.byteLength;
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const compressedPdfBlobUrl = URL.createObjectURL(blob);

  onProgress?.(100);

  return {
    originalSize,
    compressedSize,
    compressedPdfBlobUrl,
  };
}