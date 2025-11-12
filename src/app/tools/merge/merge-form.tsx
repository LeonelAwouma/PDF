'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mergePdf } from '@/ai/flows/merge-pdf';
import { Loader2, Download, X, FileCheck2, UploadCloud, Plus } from 'lucide-react';
import type { MergePdfOutput } from '@/ai/flows/merge-pdf';
import { Card, CardContent } from '@/components/ui/card';

export function MergeForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MergePdfOutput | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files!)]);
      // Reset file input to allow re-uploading the same file
      event.target.value = '';
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
        <p className="mt-4 text-lg text-muted-foreground">Merging your PDFs...</p>
      </div>
    )
  }

  if (result) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Your file is ready!</h2>
            <p className="text-muted-foreground mb-6">
              The merge process is complete. Download your combined PDF below.
            </p>
            <Button asChild size="lg">
              <a href={result.mergedPdfDataUri} download="merged.pdf">
                <Download className="mr-2 h-5 w-5" />
                Download Merged PDF
              </a>
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <form id="merge-form" onSubmit={handleSubmit}></form>
      <input
        id="pdf-files"
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isLoading}
      />

      {files.length === 0 ? (
         <div className="flex items-center justify-center w-full">
         <label htmlFor="pdf-files" className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                 <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                 <p className="mb-2 text-xl font-bold text-foreground">Select PDF files to merge</p>
                 <p className="text-muted-foreground">or drag and drop files here</p>
             </div>
         </label>
     </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="relative group"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <Card className="aspect-[3/4] flex flex-col items-center justify-center p-4">
                <FileCheck2 className="w-12 h-12 text-primary" />
                <p className="mt-2 text-sm text-center text-muted-foreground truncate w-full px-2" title={file.name}>
                  {file.name}
                </p>
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
              className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors"
            >
              <Plus className="w-10 h-10 text-primary" />
              <span className="mt-2 text-sm font-semibold text-primary">Add more files</span>
          </button>
        </div>
      )}
    </>
  );
}
