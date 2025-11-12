// app/api/protect-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Chargement dynamique côté serveur
const { createWriter, createReader, PermissionFlag } = require('muhammara');

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    if (!file || !password) {
      return NextResponse.json(
        { error: 'Fichier ou mot de passe manquant' },
        { status: 400 }
      );
    }

    // LIRE LE FICHIER EN BUFFER
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // VÉRIFIER LA SIGNATURE PDF
    if (!inputBuffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
      return NextResponse.json(
        { error: 'Fichier invalide : ce n’est pas un PDF' },
        { status: 400 }
      );
    }

    // FLUX DE SORTIE
    const outputChunks: Buffer[] = [];
    const outputStream = {
      write: (chunk: Buffer) => outputChunks.push(chunk),
      end: () => {},
    };

    // CRÉER LE WRITER
    const writer = createWriter(outputStream as any);

    // LIRE LE PDF D’ENTRÉE
    let reader;
    try {
      reader = createReader(inputBuffer);
    } catch (err: any) {
      return NextResponse.json(
        { error: 'PDF corrompu ou non lisible', details: err.message },
        { status: 400 }
      );
    }

    // COPIER LE CONTENU
    const context = writer.getCopyingContext(reader);
    context.execute();

    // PROTECTION
    const docContext = writer.getDocumentContext();
    docContext.setPassword(password);
    docContext.setOwnerPassword(password);

    // RESTRICTIONS
    docContext.setPermissions(PermissionFlag.PrintLowResolution, true);
    docContext.setPermissions(
      PermissionFlag.ModifyDocument |
      PermissionFlag.Copy |
      PermissionFlag.Annotate |
      PermissionFlag.PrintHighResolution,
      false
    );

    writer.end();

    // ATTENDRE LA FIN
    await new Promise((resolve) => setTimeout(resolve, 200));
    const encryptedPdf = Buffer.concat(outputChunks);

    if (encryptedPdf.length === 0) {
      return NextResponse.json(
        { error: 'PDF chiffré vide' },
        { status: 500 }
      );
    }

    return new NextResponse(encryptedPdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          file.name.replace('.pdf', '') + '_PROTEGE.pdf'
        )}"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Échec du chiffrement', details: error.message },
      { status: 500 }
    );
  }
};
