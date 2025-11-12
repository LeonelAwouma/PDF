"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ocrAndFormat } from '@/ai/flows/ocr-and-format';
import { Loader2, ScanText, Download, FileCheck2 } from 'lucide-react';
import type { OcrAndFormatOutput } from '@/ai/flows/ocr-and-format';

export function OcrForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrAndFormatOutput | null>(null);
  const { toast } = useToast();

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
    if (!imageFile) {
      toast({
        title: 'No file selected',
        description: 'Please upload an image file to process.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const photoDataUri = await handleFileRead(imageFile);
      const ocrResult = await ocrAndFormat({ photoDataUri });
      setResult(ocrResult);
      toast({
        title: 'Success!',
        description: 'Your file is ready for download.',
      });
    } catch (error) {
      console.error('Error in OCR process:', error);
      toast({
        title: 'OCR Failed',
        description:
          'An error occurred during the OCR process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-file">Image File</Label>
          <Input
            id="image-file"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            disabled={isLoading}
            className="file:text-primary file:font-semibold"
          />
           {imageFile && <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1"><FileCheck2 className="w-4 h-4 text-green-500" /> {imageFile.name}</p>}
        </div>
        <Button type="submit" disabled={isLoading || !imageFile} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ScanText className="mr-2 h-4 w-4" />
              Start OCR
            </>
          )}
        </Button>
      </form>

      {result && result.editablePdfDataUri && (
        <div className="p-6 bg-secondary/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Your file is ready!</h3>
          <p className="text-muted-foreground mb-4">
            The OCR process is complete. Download your editable file below.
          </p>
          <Button asChild>
            <a
              href={result.editablePdfDataUri}
              download={`${imageFile?.name.split('.')[0]}_editable.txt`}
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
