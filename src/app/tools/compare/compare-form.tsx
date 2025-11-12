"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { comparePdfQuality } from '@/ai/flows/compare-pdf-quality';
import { Loader2, FileCheck2, FileDiff, FileX2 } from 'lucide-react';
import type { ComparePdfQualityOutput } from '@/ai/flows/compare-pdf-quality';

export function CompareForm() {
  const [pdf1, setPdf1] = useState<File | null>(null);
  const [pdf2, setPdf2] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparePdfQualityOutput | null>(null);
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
    if (!pdf1 || !pdf2) {
      toast({
        title: 'Missing files',
        description: 'Please upload both PDF files to compare.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const [pdf1DataUri, pdf2DataUri] = await Promise.all([
        handleFileRead(pdf1),
        handleFileRead(pdf2),
      ]);

      const comparisonResult = await comparePdfQuality({
        pdf1DataUri,
        pdf2DataUri,
      });

      setResult(comparisonResult);
    } catch (error) {
      console.error('Error comparing PDFs:', error);
      toast({
        title: 'Comparison Failed',
        description: 'An error occurred while comparing the PDFs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pdf1">First PDF</Label>
            <Input
              id="pdf1"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdf1(e.target.files?.[0] || null)}
              disabled={isLoading}
              className="file:text-primary file:font-semibold"
            />
            {pdf1 && <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1"><FileCheck2 className="w-4 h-4 text-green-500" /> {pdf1.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdf2">Second PDF</Label>
            <Input
              id="pdf2"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdf2(e.target.files?.[0] || null)}
              disabled={isLoading}
               className="file:text-primary file:font-semibold"
            />
            {pdf2 && <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1"><FileCheck2 className="w-4 h-4 text-green-500" /> {pdf2.name}</p>}
          </div>
        </div>
        <Button type="submit" disabled={isLoading || !pdf1 || !pdf2} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <FileDiff className="mr-2 h-4 w-4" />
              Compare PDFs
            </>
          )}
        </Button>
      </form>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{result.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
