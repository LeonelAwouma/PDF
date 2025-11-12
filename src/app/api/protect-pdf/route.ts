// app/api/protect-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PermissionFlag } from 'pdf-lib';

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
    // On ne spécifie pas 'ignoreEncryption: true' pour que `isEncrypted` fonctionne
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    if (pdfDoc.isEncrypted) {
      return NextResponse.json(
        { error: 'Ce PDF est déjà protégé par un mot de passe.' },
        { status: 400 }
      );
    }

    // Appliquer le chiffrement et les permissions
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password, // Utiliser le même mot de passe pour le propriétaire
      permissions: {
        // Autoriser l'impression en basse résolution
        printing: PermissionFlag.LOW_QUALITY,
        // Interdire tout le reste
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    });

    // Sauvegarder le document PDF chiffré
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Renvoyer le PDF chiffré en pièce jointe
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
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Échec de la protection du PDF', details: error.message },
      { status: 500 }
    );
  }
};
