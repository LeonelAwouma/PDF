"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { splitPdf } from '@/ai/flows/split-pdf';
import { Loader2, Download, FileCheck2, UploadCloud, Scissors, FileText, X, Plus } from 'lucide-react';
import type { SplitPdfOutput } from '@/ai/flows/split-pdf';
import { Switch } from '@/components/ui/switch';

type Range = { from: string; to: string };

export function SplitForm() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState<Range[]>([{ from: '', to: '' }]);
  const [merge, setMerge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SplitPdfOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
    setResult(null);
    setRanges([{ from: '', to: '' }]);
  };
  
  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRangeChange = (index: number, field: keyof Range, value: string) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;
    setRanges(newRanges);
  };

  const addRange = () => {
    setRanges([...ranges, { from: '', to: '' }]);
  };

  const removeRange = (index: number) => {
    if (ranges.length > 1) {
      const newRanges = ranges.filter((_, i) => i !== index);
      setRanges(newRanges);
    }
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
    
    const rangesString = ranges
        .map(r => (r.from.trim() && r.to.trim()) ? `${r.from}-${r.to}` : (r.from.trim() || r.to.trim()))
        .filter(Boolean)
        .join(',');

    if (!rangesString) {
      toast({
        title: 'No pages specified',
        description: 'Please enter at least one page or range to extract.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const pdfDataUri = await handleFileRead(file);
      const splitResult = await splitPdf({ pdfDataUri, ranges: rangesString });
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
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Splitting your PDF...</p>
        </div>
      )
    }

    if (result) {
       return (
        <Card className="shadow-lg">
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
            <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg bg-secondary/50 flex items-center justify-center aspect-[4/5]">
            <div className="text-center">
                <FileCheck2 className="w-16 h-16 text-primary mx-auto" />
                <p className="font-semibold text-foreground mt-4">{file.name}</p>
                <p className="text-sm text-muted-foreground">PDF file selected and ready to be split.</p>
            </div>
        </div>
        <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Ranges to extract</Label>
              <div className="space-y-4 mt-2">
                {ranges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Label htmlFor={`range-from-${index}`} className="text-sm">From</Label>
                    <Input
                      id={`range-from-${index}`}
                      placeholder="Page"
                      value={range.from}
                      onChange={(e) => handleRangeChange(index, 'from', e.target.value)}
                      className="w-24 text-base"
                      disabled={isLoading}
                    />
                    <Label htmlFor={`range-to-${index}`} className="text-sm">to</Label>
                    <Input
                      id={`range-to-${index}`}
                      placeholder="Page"
                      value={range.to}
                      onChange={(e) => handleRangeChange(index, 'to', e.target.value)}
                      className="w-24 text-base"
                      disabled={isLoading}
                    />
                    {ranges.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeRange(index)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addRange} className="mt-4">
                <Plus className="mr-2 h-4 w-4"/>
                Add Range
              </Button>
            </div>
             <div className="flex items-center space-x-2">
                <Switch id="merge-ranges" checked={merge} onCheckedChange={setMerge} />
                <Label htmlFor="merge-ranges">Merge all ranges in one PDF file.</Label>
            </div>

            <Button
              type="submit"
              form="split-form"
              className="w-full text-lg py-6"
              size="lg"
            >
              <Scissors className="mr-2 h-5 w-5" />
              Split PDF
            </Button>
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
