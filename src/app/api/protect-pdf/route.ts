
// app/api/protect-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Chargement dynamique côté serveur uniquement
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

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const outputChunks: Buffer[] = [];

    // Stream personnalisé
    const outputStream = {
      write: (chunk: Buffer) => outputChunks.push(chunk),
      end: () => {},
    };

    const writer = createWriter(outputStream as any);
    const reader = createReader(inputBuffer);

    const context = writer.getCopyingContext(reader);
    context.execute();

    const docContext = writer.getDocumentContext();

    // PROTECTION
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

    // Attendre la fin
    await new Promise((resolve) => setTimeout(resolve, 100));
    const encryptedPdf = Buffer.concat(outputChunks);

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
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Échec', details: error.message },
      { status: 500 }
    );
  }
};
