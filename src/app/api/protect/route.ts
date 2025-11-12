import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    if (!file || !password) {
      return NextResponse.json({ error: 'Fichier ou mot de passe manquant' }, { status: 400 });
    }

    if (password.length < 1) {
      return NextResponse.json({ error: 'Mot de passe vide' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // Charger le PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Vérifier si déjà protégé
    if (pdfDoc.isEncrypted) {
      return NextResponse.json({ error: 'Ce PDF est déjà protégé.' }, { status: 400 });
    }

    // FORCER L'ENCRYPTION
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password, // même mot de passe
      permissions: {
        printing: 'lowResolution',  // ou 'highResolution'
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    });

    // SAUVEGARDE FORCÉE
    const pdfBytes = await pdfDoc.save();

    // VÉRIFICATION : recharger pour confirmer que c'est crypté
    try {
      const testDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      if (!testDoc.isEncrypted) {
        throw new Error('Encryption failed: PDF is not encrypted after save');
      }
    } catch (err) {
      console.error('Encryption verification failed:', err);
      return NextResponse.json({ error: 'Échec de vérification de l’encryption' }, { status: 500 });
    }

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}_PROTEGE.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { error: 'Protection échouée', details: error.message },
      { status: 500 }
    );
  }
}

    