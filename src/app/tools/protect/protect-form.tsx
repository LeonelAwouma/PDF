"use client";

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, UploadCloud, Lock, ShieldCheck, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo

export function ProtectForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Nettoyage du blob
  useEffect(() => {
    return () => {
      if (resultUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  // Glisser-déposer
  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) handleFileSelect(selected);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isLoading,
  });

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Max 50 Mo',
        variant: 'destructive',
      });
      return;
    }
    setFile(selectedFile);
    setResultUrl(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (!password) {
      toast({ title: 'Mot de passe requis', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      if (pdfDoc.isEncrypted) {
          throw new Error('This PDF is already protected.');
      }

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        encrypt: {
          userPassword: password,
          ownerPassword: password,
        },
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Nettoyer l’ancien
      if (resultUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }

      setResultUrl(url);

      toast({
        title: 'PDF protégé !',
        description: 'Le fichier est maintenant sécurisé.',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Échec de la protection',
        description: error.message || 'Erreur lors de la protection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
    setPassword('');
    setConfirmPassword('');
  };

  // === État : En cours ===
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium mt-4">Protection en cours...</p>
      </div>
    );
  }

  // === État : Résultat ===
  if (resultUrl) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <ShieldCheck className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">PDF Protégé !</h2>
          <p className="text-muted-foreground mb-6">
            Votre fichier est maintenant sécurisé par mot de passe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href={resultUrl} download={`${file?.name.replace('.pdf', '')}_protected.pdf`}>
                <Download className="mr-2 h-5 w-5" />
                Télécharger
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={reset}>
              Protéger un autre
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // === État : Formulaire ===
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!file ? (
        <div
          {...getRootProps()}
          className={`flex items-center justify-center w-full h-80 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-card ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} onChange={handleFileChange} />
          <div className="text-center">
            <UploadCloud className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-xl font-bold">Glissez ou cliquez pour uploader</p>
            <p className="text-sm text-muted-foreground">PDF uniquement • Max 50 Mo</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Aperçu fichier */}
          <div className="p-4 border rounded-lg flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mots de passe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
            size="lg"
            disabled={!password || password !== confirmPassword}
          >
            <Lock className="mr-2 h-5 w-5" />
            Protéger le PDF
          </Button>
        </div>
      )}
    </form>
  );
}
