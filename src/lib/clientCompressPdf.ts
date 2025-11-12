// src/lib/clientCompressPdf.ts
import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'low' | 'medium' | 'high';

interface CompressOptions {
  level: CompressionLevel;
  /** Callback de progression (0‑100) */
  onProgress?: (percent: number) => void;
}

/**
 * Compresse un PDF côté client.
 * Retourne un objet compatible avec l'UI.
 */
export async function clientCompressPdf(
  file: File,
  { level, onProgress }: CompressOptions
): Promise<{
  originalSize: number;
  compressedSize: number;
  compressedPdfDataUri: string;
}> {
  const originalSize = file.size;
  onProgress?.(5);

  // Étape 1 : Charger le PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { 
    ignoreEncryption: true,
   });
  onProgress?.(20);

  // Étape 2 : Supprimer les métadonnées
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  
  onProgress?.(30);

  // Étape 3 : Sauvegarder avec compression des flux d'objets
  // C'est la méthode la plus fiable avec pdf-lib pour réduire la taille
  // sans risquer de corrompre le fichier en manipulant les images.
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
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
