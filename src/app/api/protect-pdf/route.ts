import { NextRequest, NextResponse } from 'next/server';
import { createWriter, createReader, PermissionFlag } from 'muhammara';

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

    // RESTRICTIONS avec PermissionFlag
    docContext.setPermissions(
      PermissionFlag.Print |           // Impression (basse qualité)
      PermissionFlag.ModifyDocument |  // Modification
      PermissionFlag.Copy |            // Copie
      PermissionFlag.Annotate,         // Annotations
      false // Désactive tout
    );

    // Autoriser seulement l’impression basse qualité
    docContext.setPermissions(
      PermissionFlag.PrintLowResolution,
      true
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
