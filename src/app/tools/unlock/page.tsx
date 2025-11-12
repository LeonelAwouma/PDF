
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

// Wrapper pour la Web Crypto API pour une meilleure compatibilité
const cryptoSubtle = typeof window !== 'undefined' ? window.crypto.subtle : null;

// Fonctions de chiffrement/déchiffrement
async function decryptPDF(encryptedArrayBuffer: ArrayBuffer, password: string): Promise<ArrayBuffer> {
    if (!cryptoSubtle) {
        throw new Error('Web Crypto API n\'est pas disponible.');
    }
    const encryptedData = new Uint8Array(encryptedArrayBuffer);
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);

    const passwordKey = await cryptoSubtle.importKey(
        'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );

    const key = await cryptoSubtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        passwordKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
    );

    return cryptoSubtle.decrypt({ name: 'AES-GCM', iv }, key, data);
}

export default function UnlockPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPdfUrl(null); // Réinitialiser la vue
            setPassword('');
        }
    };

    const handleUnlock = async () => {
        if (!file || !password) {
            toast({
                title: 'Informations manquantes',
                description: 'Veuillez sélectionner un fichier et entrer un mot de passe.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Tente de charger le PDF avec pdf-lib pour vérifier s'il est chiffré
            try {
                await PDFDocument.load(arrayBuffer, { password });
                toast({
                    title: 'Déchiffrement réussi',
                    description: 'Le document est maintenant accessible.',
                });
            } catch (e: any) {
                // Si pdf-lib échoue, cela signifie que ce n'est probablement pas un mot de passe standard
                // ou que le fichier est corrompu.
                if (e.message.includes('Invalid password') || e.message.includes('encrypted')) {
                    throw new Error('Mot de passe incorrect ou type de chiffrement non supporté.');
                }
                // Si l'erreur est autre chose, on la relance.
                throw e;
            }

            // Si le chargement réussit, le mot de passe est correct.
            // On recrée un blob pour l'afficher
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(url);

        } catch (error: any) {
            console.error('Erreur de déverrouillage:', error);
            toast({
                title: 'Échec du déverrouillage',
                description: error.message || 'Impossible de déverrouiller ce PDF.',
                variant: 'destructive',
            });
            setPdfUrl(null);
        } finally {
            setIsLoading(false);
        }
    };

    const resetView = () => {
        setFile(null);
        setPdfUrl(null);
        setPassword('');
    }

    if (pdfUrl) {
        return (
            <Card className="w-full shadow-lg">
                 <CardHeader>
                    <CardTitle className="text-3xl font-bold">Document déverrouillé</CardTitle>
                    <div className="flex justify-between items-center">
                        <CardDescription className="text-md">
                            Votre document est maintenant accessible.
                        </CardDescription>
                        <Button onClick={resetView} variant="outline">
                            <Lock className="mr-2 h-4 w-4" />
                            Déverrouiller un autre fichier
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="aspect-[3/4] w-full">
                        <iframe src={pdfUrl} className="w-full h-full border rounded-md" title="PDF Viewer"></iframe>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Unlock PDF</CardTitle>
                    <CardDescription className="text-md">
                        This tool attempts to unlock PDF files with standard password security.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                         <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                                <p className="mb-2 text-xl font-bold text-foreground">Select a locked PDF file</p>
                                <p className="text-muted-foreground">or drag and drop a file here</p>
                            </div>
                            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    ) : (
                        <div className="space-y-4">
                           <div className="p-4 border rounded-lg flex items-center justify-between bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-6 h-6 text-primary" />
                                    <span className="font-medium">{file.name}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>Choose another file</Button>
                            </div>
                            
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="pl-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                            </div>

                            <Button onClick={handleUnlock} disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Unlocking...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Unlock PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
