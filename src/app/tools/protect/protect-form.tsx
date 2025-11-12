"use client";

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, UploadCloud, Lock, ShieldCheck } from 'lucide-react';

export function ProtectForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Clean up blob URL on unmount or when a new result is set
  useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResultUrl(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please upload a PDF file to protect.',
        variant: 'destructive',
      });
      return;
    }
    if (!password) {
      toast({
        title: 'Password is required',
        description: 'Please enter a password to protect the file.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please re-enter your passwords.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        encrypt: {
          userPassword: password,
          ownerPassword: password,
        },
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
      }

      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      toast({
        title: 'Success!',
        description: 'Your PDF is now password-protected.',
      });

    } catch (error) {
      console.error('Error protecting PDF:', error);
      toast({
        title: 'Protection Failed',
        description: 'An unexpected error occurred. The PDF might already be protected or corrupted.',
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
          <p className="text-lg font-medium mt-4">Encrypting your PDF...</p>
      </div>
    );
  }
  
  if (resultUrl) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <ShieldCheck className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">File Encrypted!</h2>
          <p className="text-muted-foreground mb-6">
            Your PDF is now password-protected.
          </p>
          <Button asChild size="lg" className="mt-4">
            <a href={resultUrl} download={`${file?.name.replace('.pdf', '')}_protected.pdf`}>
              <Download className="mr-2 h-5 w-5" />
              Download Protected PDF
            </a>
          </Button>
           <Button variant="outline" className="mt-4 ml-4" onClick={() => { setFile(null); setResultUrl(null); }}>
              Protect Another File
           </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!file ? (
        <div className="flex items-center justify-center w-full">
          <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-4 text-primary" />
              <p className="mb-2 text-xl font-bold text-foreground">Select a PDF to protect</p>
              <p className="text-muted-foreground">or drag and drop a file here</p>
            </div>
            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                        required
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                    />
                </div>
            </div>
             <Button type="submit" className="w-full md:w-auto" size="lg" disabled={!file || !password || password !== confirmPassword}>
                <Lock className="mr-2 h-5 w-5" />
                Protect PDF
            </Button>
        </div>
      )}
    </form>
  );
}
