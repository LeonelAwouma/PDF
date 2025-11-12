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
  level: CompressionLevel, // Le niveau n'est pas utilisé ici, mais gardé pour la compatibilité de l'interface
  onProgress?: (percent: number) => void
): Promise<CompressResult> {
  const originalSize = file.size;

  // Étape 1 : Charger le PDF
  onProgress?.(10);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  onProgress?.(30);

  // Étape 2 : Supprimer les métadonnées pour réduire la taille
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  onProgress?.(50);

  // Étape 3 : Sauvegarder le document en utilisant les "object streams".
  // C'est la principale source de compression dans pdf-lib.
  // Cela regroupe plusieurs objets en un seul flux, réduisant la taille globale.
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
  });
  onProgress?.(90);

  const compressedSize = pdfBytes.byteLength;
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const compressedPdfDataUri = URL.createObjectURL(blob);
  onProgress?.(100);

  return {
    originalSize,
    compressedSize,
    compressedPdfDataUri,
  };
}
