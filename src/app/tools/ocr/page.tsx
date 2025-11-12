import { OcrForm } from './ocr-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function OcrPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">OCR PDF</CardTitle>
          <CardDescription className="text-md">
            Convert scanned documents and images into editable and searchable
            PDF files using Optical Character Recognition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OcrForm />
        </CardContent>
      </Card>
    </div>
  );
}
