"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { splitPdf } from '@/ai/flows/split-pdf';
import { Loader2, Download, FileCheck2, UploadCloud, Scissors, FileText } from 'lucide-react';
import type { SplitPdfOutput } from '@/ai/flows/split-pdf';

export function SplitForm() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SplitPdfOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
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
        description: 'Please upload a PDF file to split.',
        variant: 'destructive',
      });
      return;
    }
    if (!ranges.trim()) {
      toast({
        title: 'No pages specified',
        description: 'Please enter the page numbers or ranges to extract.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const pdfDataUri = await handleFileRead(file);
      const splitResult = await splitPdf({ pdfDataUri, ranges });
      setResult(splitResult);
      toast({
        title: 'Success!',
        description: 'Your split PDF is ready for download.',
      });
    } catch (error: any) {
      console.error('Error splitting PDF:', error);
      toast({
        title: 'Split Failed',
        description: error.message || 'An error occurred while splitting the PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const FormContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Splitting your PDF...</p>
        </div>
      )
    }

    if (result) {
       return (
        <Card className="shadow-none border-0">
          <CardContent className="p-6 text-center">
              <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your file is ready!</h2>
              <p className="text-muted-foreground mb-6">
                The extracted PDF with {result.pageCount} page(s) is complete. Download it below.
              </p>
              <Button asChild size="lg">
                <a href={result.splitPdfDataUri} download={`${file?.name.replace('.pdf', '')}_split.pdf`}>
                  <Download className="mr-2 h-5 w-5" />
                  Download Split PDF
                </a>
              </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!file) {
      return (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                    <p className="mb-2 text-xl font-bold text-foreground">Select a PDF file to split</p>
                    <p className="text-muted-foreground">or drag and drop a file here</p>
                </div>
            </label>
        </div>
      );
    }

    return (
        <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-secondary/50">
                <div className="flex items-center gap-4">
                    <FileCheck2 className="w-8 h-8 text-primary" />
                    <div>
                        <p className="font-semibold text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">PDF file selected and ready to be split.</p>
                    </div>
                </div>
            </div>
            <div>
              <Label htmlFor="ranges" className="text-lg font-semibold">Pages to extract</Label>
              <Input
                id="ranges"
                placeholder="e.g., 1, 3, 5-8"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                className="mt-2 text-base"
                disabled={isLoading}
              />
            </div>
        </div>
    );
  }

  return (
    <>
      <form id="split-form" onSubmit={handleSubmit}></form>
      <input
        id="pdf-file"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isLoading}
      />
      <FormContent />
    </>
  );
}
