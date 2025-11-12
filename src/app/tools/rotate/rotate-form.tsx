"use client";

import { useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, UploadCloud, RotateCw, FileCheck2, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type RotationAngle = 90 | 180 | 270;

export function RotateForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rotationAngle, setRotationAngle] = useState<RotationAngle>(90);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResultUrl(null);
    setPreviews([]);
    setSelectedPages(new Set());
    if (selectedFile) {
      generatePreviews(selectedFile);
    }
  };

  const generatePreviews = useCallback(async (pdfFile: File) => {
    setIsLoading(true);
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await getDocument(typedarray).promise;
        const previewUrls: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            previewUrls.push(canvas.toDataURL());
          }
        }
        setPreviews(previewUrls);
        // Select all pages by default
        setSelectedPages(new Set(Array.from({ length: pdf.numPages }, (_, i) => i)));
      };
      fileReader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error('Error generating PDF previews:', error);
      toast({ title: 'Preview Error', description: 'Could not generate PDF previews.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(pageIndex)) {
        newSelection.delete(pageIndex);
      } else {
        newSelection.add(pageIndex);
      }
      return newSelection;
    });
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || selectedPages.size === 0) {
      toast({
        title: 'No pages selected',
        description: 'Please select at least one page to rotate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      selectedPages.forEach(pageIndex => {
        const page = pdfDoc.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotationAngle));
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
      }

      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      toast({
        title: 'Rotation successful!',
        description: `${selectedPages.size} page(s) rotated successfully.`,
      });

    } catch (error) {
      console.error('Error rotating PDF:', error);
      toast({
        title: 'Rotation Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FormContent = () => {
    if (isLoading && previews.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium mt-4">Loading PDF...</p>
          </div>
        );
    }

    if (resultUrl) {
      return (
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <RotateCw className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Rotation Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your rotated PDF is ready for download.
            </p>
            <Button asChild size="lg" className="mt-4">
              <a href={resultUrl} download={`${file?.name.replace('.pdf', '')}_rotated.pdf`}>
                <Download className="mr-2 h-5 w-5" />
                Download Rotated PDF
              </a>
            </Button>
             <Button variant="outline" className="mt-4 ml-4" onClick={() => { setFile(null); setResultUrl(null); setPreviews([]); setSelectedPages(new Set()); }}>
                Rotate Another File
             </Button>
          </CardContent>
        </Card>
      );
    }

    if (!file) {
      return (
        <div className="flex items-center justify-center w-full">
          <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-4 text-primary" />
              <p className="mb-2 text-xl font-bold text-foreground">Select a PDF file to rotate</p>
              <p className="text-muted-foreground">or drag and drop a file here</p>
            </div>
            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      );
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <Label className="text-lg font-semibold">Select pages to rotate</Label>
                <p className="text-sm text-muted-foreground mb-4">Click on the pages to select or deselect them for rotation.</p>
                <div className="border rounded-lg bg-secondary/50 max-h-[400px] overflow-y-auto p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="relative cursor-pointer group" onClick={() => togglePageSelection(index)}>
                                <img src={src} alt={`Page ${index + 1}`} className={`w-full border-4 rounded-md ${selectedPages.has(index) ? 'border-primary' : 'border-transparent'}`} />
                                <div className={`absolute inset-0 bg-primary/20 ${selectedPages.has(index) ? 'opacity-100' : 'opacity-0'} group-hover:opacity-50 transition-opacity`}></div>
                                <div className="absolute top-1 right-1 bg-background/80 rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold">{index + 1}</div>
                                {selectedPages.has(index) && (
                                    <div className="absolute bottom-1 right-1 bg-primary rounded-full p-1">
                                        <Check className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="flex justify-end mt-2">
                    <Button variant="link" size="sm" onClick={() => setSelectedPages(new Set(previews.map((_, i) => i)))}>Select All</Button>
                    <Button variant="link" size="sm" onClick={() => setSelectedPages(new Set())}>Deselect All</Button>
                 </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold">Rotation Angle</Label>
               <RadioGroup
                    value={String(rotationAngle)}
                    onValueChange={(value) => setRotationAngle(Number(value) as RotationAngle)}
                    className="grid grid-cols-3 gap-4 mt-2"
                >
                    {[90, 180, 270].map(angle => (
                        <Label key={angle} htmlFor={`angle-${angle}`} className={`border rounded-md p-4 flex items-center justify-center text-center cursor-pointer ${rotationAngle === angle ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                            <RadioGroupItem value={String(angle)} id={`angle-${angle}`} className="sr-only" />
                            <RotateCw className="w-6 h-6 mb-2" />
                            <span>{angle}°</span>
                        </Label>
                    ))}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading || selectedPages.size === 0}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RotateCw className="mr-2 h-5 w-5" />}
                Rotate PDF
            </Button>
        </form>
    );
  }

  return <FormContent />;
}
