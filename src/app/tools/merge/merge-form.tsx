'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mergePdf } from '@/ai/flows/merge-pdf';
import { Loader2, Download, Combine, X, FileCheck2 } from 'lucide-react';
import type { MergePdfOutput } from '@/ai/flows/merge-pdf';

export function MergeForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MergePdfOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
    if (files.length < 2) {
      toast({
        title: 'Not enough files',
        description: 'Please upload at least two PDF files to merge.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const pdfDataUris = await Promise.all(files.map(handleFileRead));
      const mergeResult = await mergePdf({ pdfDataUris });
      setResult(mergeResult);
      toast({
        title: 'Success!',
        description: 'Your merged PDF is ready for download.',
      });
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast({
        title: 'Merge Failed',
        description: 'An error occurred while merging the PDFs. Please try again.',
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
          <Label htmlFor="pdf-files">PDF Files</Label>
          <Input
            id="pdf-files"
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
            className="file:text-primary file:font-semibold"
          />
          <p className="text-sm text-muted-foreground">Select two or more PDF files to combine.</p>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                   <span className="flex items-center gap-2">
                     <FileCheck2 className="w-4 h-4 text-green-500" /> 
                     {file.name}
                   </span>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={isLoading}>
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="submit" disabled={isLoading || files.length < 2} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Merging...
            </>
          ) : (
            <>
              <Combine className="mr-2 h-4 w-4" />
              Merge PDFs
            </>
          )}
        </Button>
      </form>

      {result && result.mergedPdfDataUri && (
        <div className="p-6 bg-secondary/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Your file is ready!</h3>
          <p className="text-muted-foreground mb-4">
            The merge process is complete. Download your combined PDF below.
          </p>
          <Button asChild>
            <a href={result.mergedPdfDataUri} download="merged.pdf">
              <Download className="mr-2 h-4 w-4" />
              Download Merged PDF
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
