
// app/api/protect-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import qpdf from 'node-qpdf';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const POST = async (req: NextRequest) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file || !password || password.trim() === '') {
      return NextResponse.json(
        { error: 'Fichier ou mot de passe manquant' },
        { status: 400 }
      );
    }

    // Chemins temporaires
    inputPath = join(tmpdir(), `input_${Date.now()}.pdf`);
    outputPath = join(tmpdir(), `output_${Date.now()}.pdf`);

    // Écrire le fichier d'entrée
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    // CORRECTION : utiliser `outputFile`, pas `output`
    await qpdf.encrypt(inputPath, {
      outputFile: outputPath,  // CLEF CORRECTE
      keyLength: 256,
      password: password,
      restrictions: {
        print: 'low',
        modify: 'none',
        extract: 'n',
        annotate: 'n',
      },
    });

    // Vérifier que le fichier existe
    const fs = await import('fs');
    if (!fs.existsSync(outputPath)) {
      throw new Error('Fichier chiffré non généré');
    }

    const encryptedBuffer = await readFile(outputPath);
    const blob = new Blob([encryptedBuffer], { type: 'application/pdf' });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          file.name.replace('.pdf', '') + '_PROTEGE.pdf'
        )}"`,
      },
    });
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: 'Échec du chiffrement', details: error.message },
      { status: 500 }
    );
  } finally {
    // Nettoyage
    if (inputPath) await unlink(inputPath).catch(() => {});
    if (outputPath) await unlink(outputPath).catch(() => {});
  }
};
