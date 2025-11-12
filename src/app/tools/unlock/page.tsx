
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, KeyRound, Unlock, FileCheck2, Loader2 } from 'lucide-react';

export default function UnlockPage() {
    const { toast } = useToast();

    // The core decryption logic from your HTML file is now inside useEffect
    useEffect(() => {
        const { getDocument, GlobalWorkerOptions } = require('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
        const unlockButton = document.getElementById('unlockButton');
        const viewer = document.getElementById('viewer');
        const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
        const loader = document.getElementById('loader');

        const handleFileChange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            const fileInfo = document.getElementById('file-info');
            const uploadPrompt = document.getElementById('upload-prompt');

            if (file && fileInfo && uploadPrompt) {
                 fileInfo.querySelector('span')!.textContent = file.name;
                 fileInfo.classList.remove('hidden');
                 uploadPrompt.classList.add('hidden');
            }
        }
        
        const unlockPDF = async () => {
            const file = fileInput.files?.[0];
            const password = passwordInput.value;

            if (!file || !password) {
                toast({ title: 'Erreur', description: 'Veuillez sélectionner un fichier et entrer un mot de passe.', variant: 'destructive' });
                return;
            }
            
            if (loader) loader.classList.remove('hidden');
            if (viewer) viewer.style.display = 'none';

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await getDocument({ data: arrayBuffer, password }).promise;
                
                if (viewer) viewer.style.display = 'block';
                if (loader) loader.classList.add('hidden');
                
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context!, viewport: viewport }).promise;
                toast({ title: 'Succès', description: 'PDF déverrouillé et affiché.' });

            } catch (error: any) {
                 if (loader) loader.classList.add('hidden');
                 let message = 'Impossible de déverrouiller ce PDF.';
                 if (error.name === 'PasswordException') {
                     message = 'Mot de passe incorrect.';
                 }
                 toast({ title: 'Échec du déverrouillage', description: message, variant: 'destructive' });
            }
        };

        fileInput?.addEventListener('change', handleFileChange);
        unlockButton?.addEventListener('click', unlockPDF);
        passwordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') unlockPDF();
        });

        // Cleanup function
        return () => {
            fileInput?.removeEventListener('change', handleFileChange);
            unlockButton?.removeEventListener('click', unlockPDF);
            passwordInput?.removeEventListener('keypress', (e) => {
                if (e.key === 'Enter') unlockPDF();
            });
        };
    }, [toast]);

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Unlock PDF</CardTitle>
                    <CardDescription className="text-md">
                       Entrez le mot de passe pour visualiser un document PDF protégé.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div id="upload-prompt">
                        <label htmlFor="fileInput" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                                <p className="mb-2 text-xl font-bold text-foreground">Sélectionnez un PDF verrouillé</p>
                                <p className="text-muted-foreground">Cliquez ou glissez-déposez</p>
                            </div>
                            <input id="fileInput" type="file" accept=".pdf" className="hidden" />
                        </label>
                    </div>

                    <div id="file-info" className="hidden p-4 border rounded-lg items-center justify-between bg-secondary/30">
                        <div className="flex items-center gap-3">
                            <FileCheck2 className="w-6 h-6 text-green-500" />
                            <span className="font-medium"></span>
                        </div>
                    </div>

                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="passwordInput" type="password" placeholder="Entrez le mot de passe" className="pl-10" />
                    </div>

                    <Button id="unlockButton" className="w-full">
                        <Unlock className="mr-2 h-4 w-4" />
                        Déverrouiller et Afficher
                    </Button>

                    <div id="loader" className="hidden flex-col items-center justify-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg font-medium mt-4">Déchiffrement en cours...</p>
                    </div>

                    <div id="viewer" style={{ display: 'none' }} className="border rounded-lg p-4">
                        <canvas id="pdf-canvas"></canvas>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
