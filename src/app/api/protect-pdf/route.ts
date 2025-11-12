// app/api/protect-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const POST = async (req: NextRequest) => {
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

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
        // Important: Ne pas ignorer le chiffrement pour pouvoir vérifier
        ignoreEncryption: false 
    });

    if (pdfDoc.isEncrypted) {
      return NextResponse.json(
        { error: 'Ce PDF est déjà protégé.' },
        { status: 400 }
      );
    }

    // Protection
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password, // Important : Mettre le même pour éviter les confusions
      permissions: {
        printing: 'lowResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

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
    // Gérer l'erreur si pdfDoc.encrypt n'est pas une fonction
     if (error.message.includes('encrypt is not a function')) {
         return NextResponse.json(
             { error: 'La version de la bibliothèque PDF ne supporte pas le chiffrement côté serveur.', details: error.message },
             { status: 500 }
         );
     }
    return NextResponse.json(
      { error: 'Échec de la protection', details: error.message },
      { status: 500 }
    );
  }
};
