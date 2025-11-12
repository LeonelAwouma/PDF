
"use client";

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, UploadCloud, FileCheck2, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PdfToImageForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');
  const { toast } = useToast();

  // Clean up blob URLs on unmount or when new images are generated
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setImageUrls([]); // Clear previous results
    } else {
      setFile(null);
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
    }
  };

  const convertPdfToImages = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    // Clean up any existing blob URLs before creating new ones
    imageUrls.forEach(URL.revokeObjectURL);
    
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;
      
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await getDocument(typedarray).promise;
        const urls: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, `image/${imageFormat}`));
            if (blob) {
                urls.push(URL.createObjectURL(blob));
            }
          }
        }
        setImageUrls(urls);
        toast({
          title: 'Conversion Successful',
          description: `${pdf.numPages} page(s) converted to ${imageFormat.toUpperCase()}.`,
        });
      };
      fileReader.readAsArrayBuffer(file);

    } catch (error) {
      console.error('Error converting PDF to images:', error);
      toast({
        title: 'Conversion Failed',
        description: 'An error occurred while converting the PDF. Please try another file.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [file, imageUrls, imageFormat, toast]);
  
  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    const fileName = file?.name.replace('.pdf', '') || 'page';
    link.download = `${fileName}_page_${index + 1}.${imageFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Converting your PDF...</p>
      </div>
    );
  }
  
  if (imageUrls.length > 0) {
      return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                        <Card className="aspect-[3/4] flex items-center justify-center p-2 overflow-hidden">
                            <Image
                                src={url}
                                alt={`Page ${index + 1}`}
                                width={200}
                                height={280}
                                className="object-contain max-h-full max-w-full rounded-md"
                            />
                        </Card>
                        <Button
                            size="sm"
                            className="absolute bottom-2 right-2 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => downloadImage(url, index)}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            <span>Save</span>
                        </Button>
                    </div>
                ))}
            </div>
             <Button variant="outline" onClick={() => { setFile(null); setImageUrls([]); }}>
              Convert another file
             </Button>
        </div>
      )
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="flex items-center justify-center w-full">
         <label htmlFor="pdf-to-image-file" className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                 <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                 <p className="mb-2 text-xl font-bold text-foreground">Select a PDF to convert</p>
                 <p className="text-muted-foreground">or drag and drop a file here</p>
             </div>
             <Input id="pdf-to-image-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
         </label>
        </div>
      ) : (
        <div className="p-4 border rounded-lg flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-3">
                  <FileCheck2 className="w-6 h-6 text-green-500" />
                  <span className="font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Choose another file</Button>
        </div>
      )}

      {file && (
        <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-grow">
                <Label htmlFor="image-format">Image Format</Label>
                <Select value={imageFormat} onValueChange={(value: 'jpeg' | 'png') => setImageFormat(value)}>
                    <SelectTrigger id="image-format">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jpeg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={convertPdfToImages} disabled={isLoading} size="lg" className="w-full sm:w-auto self-end">
                <ImageIcon className="mr-2 h-5 w-5" />
                Convert to {imageFormat.toUpperCase()}
            </Button>
        </div>
      )}
    </div>
  );
}
