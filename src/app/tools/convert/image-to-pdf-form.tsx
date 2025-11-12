
"use client";

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, X, UploadCloud, Plus, Image as ImageIcon, FileCheck2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export function ImageToPdfForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const imageFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
      setFiles((prevFiles) => [...prevFiles, ...imageFiles]);
      event.target.value = ''; // Reset file input
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please upload at least one image file.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResultUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
            // Fallback for other image types by converting to PNG
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = await new Promise<HTMLImageElement>(resolve => {
                const i = document.createElement('img');
                i.onload = () => resolve(i);
                i.src = URL.createObjectURL(new Blob([arrayBuffer]));
            });
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            const pngArrayBuffer = await (await fetch(pngDataUrl)).arrayBuffer();
            image = await pdfDoc.embedPng(pngArrayBuffer);
            URL.revokeObjectURL(img.src);
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      toast({
        title: 'Success!',
        description: 'Your PDF is ready for download.',
      });
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      toast({
        title: 'Conversion Failed',
        description: 'An error occurred while converting the images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);
    
    setFiles(newFiles);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Creating your PDF...</p>
      </div>
    );
  }
  
  if (resultUrl) {
    return (
      <Card className="shadow-lg text-center p-8">
        <FileCheck2 className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your PDF is ready!</h2>
        <p className="text-muted-foreground mb-6">
          The conversion is complete. Download your new PDF below.
        </p>
        <Button asChild size="lg">
          <a href={resultUrl} download="converted.pdf">
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </a>
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <input
        id="image-files"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isLoading}
      />

      {files.length === 0 ? (
         <div className="flex items-center justify-center w-full">
         <label htmlFor="image-files" className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                 <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                 <p className="mb-2 text-xl font-bold text-foreground">Select images to convert</p>
                 <p className="text-muted-foreground">or drag and drop files here</p>
             </div>
         </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="relative group cursor-move"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <Card className="aspect-square flex items-center justify-center p-2 overflow-hidden">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={150}
                  height={150}
                  className="object-contain max-h-full max-w-full rounded-md"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} // Clean up object URL after load
                />
              </Card>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
           <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors"
            >
              <Plus className="w-10 h-10 text-primary" />
              <span className="mt-2 text-sm font-semibold text-primary">Add more images</span>
          </button>
        </div>
      )}
      
      {files.length > 0 && (
        <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="w-full">
          <ImageIcon className="mr-2 h-5 w-5" />
          Convert to PDF
        </Button>
      )}
    </div>
  );
}
