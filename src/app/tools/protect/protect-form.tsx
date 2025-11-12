"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export function ProtectForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        title: 'File is too large',
        description: `The maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
        variant: 'destructive',
      });
      return;
    }
    setFile(selectedFile);
    setPassword('');
    setConfirmPassword('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const reset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!file || !password || password !== confirmPassword) return;
  
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
  
    try {
      console.log('Envoi API...');
  
      const res = await fetch('/api/protect-pdf', {
        method: 'POST',
        body: formData,
      });
  
      console.log('Réponse:', res.status, res.statusText, res.headers.get('content-type'));
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
  
      // FORCER LE BLOB
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        throw new Error(`Mauvais type: ${contentType}`);
      }
  
      const blob = await res.blob();
      if (blob.size === 0) throw new Error('Blob vide');
  
      console.log('Blob reçu:', blob.size, 'octets');
  
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_PROTEGE.pdf`;
      a.click();
      URL.revokeObjectURL(url);
  
      toast({ title: 'PDF Protégé !' });
      reset();
  
    } catch (error: any) {
      console.error('ERREUR CLIENT:', error);
      toast({
        title: 'Échec',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium mt-4">Protection de votre PDF...</p>
      </div>
    );
  }

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
            <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-xl font-bold">Glissez & déposez ou cliquez pour uploader</p>
            <p className="text-sm text-muted-foreground">PDF uniquement • Max 50MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={reset}>
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Définir un mot de passe</Label>
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
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
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
