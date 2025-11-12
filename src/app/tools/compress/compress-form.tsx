'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { compressPdf } from '@/ai/flows/compress-pdf';
import { Loader2, Download, FileCheck2, UploadCloud, FileArchive } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CompressPdfOutput } from '@/ai/flows/compress-pdf';
import { Progress } from '@/components/ui/progress';

export function CompressForm() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompressPdfOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
  };

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please upload a PDF file to compress.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const pdfDataUri = await handleFileRead(file);
      const compressResult = await compressPdf({ pdfDataUri, compressionLevel });
      setResult(compressResult);
      toast({
        title: 'Success!',
        description: 'Your compressed PDF is ready for download.',
      });
    } catch (error: any) {
      console.error('Error compressing PDF:', error);
      toast({
        title: 'Compression Failed',
        description: error.message || 'An error occurred while compressing the PDF.',
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

  if (result) {
    const reduction = result.originalSize > 0
      ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
      : 0;
      
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <FileArchive className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Compression Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Your file size has been reduced by {reduction}%.
          </p>
          <div className="w-full max-w-md mx-auto my-4 text-left">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Original: {formatBytes(result.originalSize)}</span>
                <span>Compressed: {formatBytes(result.compressedSize)}</span>
            </div>
            <Progress value={100 - reduction} className="h-2" />
          </div>
          <Button asChild size="lg" className="mt-4">
            <a href={result.compressedPdfDataUri} download={`${file?.name.replace('.pdf', '')}_compressed.pdf`}>
              <Download className="mr-2 h-5 w-5" />
              Download Compressed PDF
            </a>
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
              <p className="mb-2 text-xl font-bold text-foreground">Select a PDF file to compress</p>
              <p className="text-muted-foreground">or drag and drop a file here</p>
            </div>
            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" disabled={isLoading} />
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
            <Label className="text-lg font-semibold">Compression Level</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Higher compression reduces file size more, but may affect quality.
            </p>
            <RadioGroup
              value={compressionLevel}
              onValueChange={(value) => setCompressionLevel(value as 'low' | 'medium' | 'high')}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              disabled={isLoading}
            >
              <Label htmlFor="low" className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${compressionLevel === 'low' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <RadioGroupItem value="low" id="low" className="sr-only" />
                <h3 className="text-lg font-semibold">Low</h3>
                <p className="text-sm text-muted-foreground text-center">Good quality, basic compression.</p>
              </Label>
              <Label htmlFor="medium" className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${compressionLevel === 'medium' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <RadioGroupItem value="medium" id="medium" className="sr-only" />
                <h3 className="text-lg font-semibold">Medium</h3>
                <p className="text-sm text-muted-foreground text-center">Recommended balance of size and quality.</p>
              </Label>
               <Label htmlFor="high" className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer ${compressionLevel === 'high' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <RadioGroupItem value="high" id="high" className="sr-only" />
                <h3 className="text-lg font-semibold">High</h3>
                <p className="text-sm text-muted-foreground text-center">Smallest file size, may reduce quality.</p>
              </Label>
            </RadioGroup>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !file} className="w-full md:w-auto" size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Compressing...
          </>
        ) : (
          <>
            <FileArchive className="mr-2 h-5 w-5" />
            Compress PDF
          </>
        )}
      </Button>
    </form>
  );
}
