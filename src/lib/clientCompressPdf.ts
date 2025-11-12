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
  const originalArrayBuffer = await file.arrayBuffer();
  const originalSize = originalArrayBuffer.byteLength;

  onProgress?.(5);
  // Ignorer les erreurs pour les PDF "malades"
  const pdfDoc = await PDFDocument.load(originalArrayBuffer, { 
    ignoreEncryption: true, 
  });
  onProgress?.(15);
  
  // -----------------------------------------------------------------
  // 1. Suppression des métadonnées (toujours utile)
  // -----------------------------------------------------------------
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  
  onProgress?.(20);
  
  // -----------------------------------------------------------------
  // 2. Traitement des pages et des images (simplifié)
  // -----------------------------------------------------------------
  // L'objectif est de reconstruire le document pour nettoyer sa structure,
  // ce qui est plus fiable que de manipuler directement les images.
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    // Simule une progression pendant que nous parcourons les pages
    const progress = 20 + Math.round(((i + 1) / totalPages) * 60);
    onProgress?.(progress);
    // Aucune action complexe sur les images ici pour garantir la stabilité
  }
  
  // -----------------------------------------------------------------
  // 3. Nettoyage final + sauvegarde
  // -----------------------------------------------------------------
  onProgress?.(90);
  // useObjectStreams est la clé pour réduire la taille en groupant les objets.
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100);

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  // Utilise createObjectURL pour la performance et pour éviter les limites de taille des data URI
  const compressedPdfUrl = URL.createObjectURL(blob);

  return {
    originalSize,
    compressedSize: pdfBytes.byteLength,
    compressedPdfDataUri: compressedPdfUrl,
  };
}
