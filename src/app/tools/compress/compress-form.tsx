'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileCheck2, UploadCloud, FileArchive } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { clientCompressPdf, type CompressionLevel } from '@/lib/clientCompressPdf';

type Result = {
  originalSize: number;
  compressedSize: number;
  compressedPdfDataUri: string;
};

export function CompressForm() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setProgress(0);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: 'Aucun fichier sélectionné',
        description: 'Veuillez télécharger un fichier PDF à compresser.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const compressResult = await clientCompressPdf(file, {
        level: compressionLevel,
        onProgress: (p) => setProgress(p),
      });

      setResult(compressResult);
      toast({
        title: 'Succès !',
        description: 'Votre PDF compressé est prêt.',
      });
    } catch (error: any) {
      console.error('Error compressing PDF:', error);
      toast({
        title: 'Erreur de compression',
        description: error.message || 'Une erreur est survenue lors de la compression du PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const compressionLevelText = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Élevée',
  };
  
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (result) {
        // Cleanup the object URL after download
        setTimeout(() => {
            URL.revokeObjectURL(result.compressedPdfDataUri);
        }, 100);
    }
  };

  if (result) {
    const reduction = result.originalSize > 0
      ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
      : 0;
      
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <FileArchive className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Compression terminée !</h2>
          <p className="text-muted-foreground mb-6">
             Votre fichier a été réduit de {reduction}% avec une compression {compressionLevelText[compressionLevel].toLowerCase()}.
          </p>
          <div className="w-full max-w-md mx-auto my-4 text-left">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Original: {formatBytes(result.originalSize)}</span>
                <span>Compressé: {formatBytes(result.compressedSize)}</span>
            </div>
            <Progress value={100 - reduction} className="h-2" />
          </div>
          <Button asChild size="lg" className="mt-4">
            <a href={result.compressedPdfDataUri} download={`${file?.name.replace('.pdf', '')}_compressed.pdf`} onClick={handleDownload}>
              <Download className="mr-2 h-5 w-5" />
              Télécharger le PDF compressé
            </a>
          </Button>
           <Button variant="outline" className="mt-4 ml-4" onClick={() => { setFile(null); setResult(null); }}>
              Compresser un autre fichier
           </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium mt-4">Compression en cours...</p>
            <Progress value={progress} className="w-full max-w-md mt-4" />
            <p className="text-muted-foreground text-sm mt-2">{progress}%</p>
        </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!file ? (
        <div className="flex items-center justify-center w-full">
          <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-4 text-primary" />
              <p className="mb-2 text-xl font-bold text-foreground">Sélectionnez un fichier PDF à compresser</p>
              <p className="text-muted-foreground">ou glissez-déposez un fichier ici</p>
            </div>
            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-3">
                  <FileCheck2 className="w-6 h-6 text-green-500" />
                  <span className="font-medium">{file.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatBytes(file.size)}</span>
          </div>

          <div>
            <Label className="text-lg font-semibold">Niveau de compression</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Une compression plus élevée réduit davantage la taille du fichier, mais peut affecter la qualité des images.
            </p>
            <RadioGroup
              value={compressionLevel}
              onValueChange={(value) => setCompressionLevel(value as CompressionLevel)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Label htmlFor="low" className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${compressionLevel === 'low' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <RadioGroupItem value="low" id="low" className="sr-only" />
                <h3 className="text-lg font-semibold">Basse</h3>
                <p className="text-sm text-muted-foreground text-center">Bonne qualité, compression légère.</p>
              </Label>
              <Label htmlFor="medium" className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${compressionLevel === 'medium' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <RadioGroupItem value="medium" id="medium" className="sr-only" />
                <h3 className="text-lg font-semibold">Moyenne</h3>
                <p className="text-sm text-muted-foreground text-center">Équilibre recommandé entre taille et qualité.</p>
              </Label>
               <Label htmlFor="high" className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${compressionLevel === 'high' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <RadioGroupItem value="high" id="high" className="sr-only" />
                <h3 className="text-lg font-semibold">Élevée</h3>
                <p className="text-sm text-muted-foreground text-center">Taille de fichier la plus petite, qualité d'image réduite.</p>
              </Label>
            </RadioGroup>
          </div>
        </div>
      )}
      
      {file && (
        <Button type="submit" className="w-full md:w-auto" size="lg">
          <FileArchive className="mr-2 h-5 w-5" />
          Compresser le PDF
        </Button>
      )}
    </form>
  );
}
