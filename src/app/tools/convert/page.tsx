
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToolPlaceholderPage } from '@/components/tool-placeholder-page';

export default function ConvertPage() {
  const [activeTab, setActiveTab] = useState('image-to-pdf');

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Convert Files</CardTitle>
          <CardDescription className="text-md">
            Convert your files to and from PDF format with ease.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image-to-pdf">Image to PDF</TabsTrigger>
              <TabsTrigger value="pdf-to-image">PDF to Image</TabsTrigger>
            </TabsList>
            <TabsContent value="image-to-pdf">
               <div className="pt-6">
                <ToolPlaceholderPage
                    title="Image to PDF Converter"
                    description="This tool will allow you to convert JPG, PNG, and other image formats into a PDF document. Coming soon!"
                />
               </div>
            </TabsContent>
            <TabsContent value="pdf-to-image">
                <div className="pt-6">
                    <ToolPlaceholderPage
                        title="PDF to Image Converter"
                        description="This tool will allow you to convert each page of a PDF into a high-quality JPG or PNG image. Coming soon!"
                    />
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
