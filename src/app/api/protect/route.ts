'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    if (!file || !password) {
      return NextResponse.json({ error: 'Missing file or password' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    if (pdfDoc.isEncrypted) {
      return NextResponse.json({ error: 'This PDF is already protected.' }, { status: 400 });
    }

    const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        encrypt: {
          userPassword: password,
          ownerPassword: password,
        },
    });

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}_protected.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error protecting PDF on server:', error);
    return NextResponse.json(
      { error: 'Failed to protect PDF', details: error.message },
      { status: 500 }
    );
  }
}
