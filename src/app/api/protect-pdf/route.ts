// app/api/protect-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

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

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
        ignoreEncryption: true // Permet de charger un PDF déjà chiffré pour le rechiffrer
    });

    const permissions = {
        printing: 'lowResolution' as const,
        modifying: false,
        copying: false,
        annotating: false,
    }

    const encryptedBytes = await pdfDoc.save({
      encrypt: {
        userPassword: password,
        ownerPassword: password,
        permissions: permissions,
      },
    });

    return new NextResponse(encryptedBytes, {
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
