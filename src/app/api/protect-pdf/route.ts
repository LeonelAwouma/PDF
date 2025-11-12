import { NextRequest, NextResponse } from 'next/server';
import qpdf from 'node-qpdf';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export async function POST(req: NextRequest) {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file || !password || password.trim() === '') {
      return NextResponse.json({ error: 'Fichier ou mot de passe manquant' }, { status: 400 });
    }

    // Créer fichiers temporaires
    const bytes = await file.arrayBuffer();
    inputPath = join(tmpdir(), `input_${Date.now()}.pdf`);
    outputPath = join(tmpdir(), `output_${Date.now()}.pdf`);

    await writeFile(inputPath, Buffer.from(bytes));

    // Chiffrer avec QPDF (AES-256, restrictions)
    await qpdf.encrypt(inputPath, {
      output: outputPath,
      keyLength: 256,  // AES-256 (le plus sécurisé)
      password: password,
      restrictions: {
        print: 'low',  // Impression basse résolution
        modify: 'none',  // Pas de modification
        extract: 'n',  // Pas d'extraction
        annotate: 'n',  // Pas d'annotations
      },
    });

    // Lire le fichier chiffré
    const encryptedBytes = await readFile(outputPath);
    const blob = new Blob([encryptedBytes], { type: 'application/pdf' });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}_PROTEGE.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur chiffrement:', error);
    return NextResponse.json(
      { error: 'Échec du chiffrement', details: error.message },
      { status: 500 }
    );
  } finally {
    // Nettoyage
    if (inputPath) await unlink(inputPath).catch(console.error);
    if (outputPath) await unlink(outputPath).catch(console.error);
  }
}
