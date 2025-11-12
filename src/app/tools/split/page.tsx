import { SplitForm } from './split-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';


export default function SplitPage() {
  return (
    <div className="max-w-4xl mx-auto">
       <Card className="w-full shadow-lg">
          <CardHeader>
              <CardTitle className="text-3xl font-bold">Split PDF</CardTitle>
              <CardDescription className="text-md">
                  Extract pages from your PDF files. Select a PDF and enter the page ranges you want to extract.
              </CardDescription>
          </CardHeader>
          <CardContent>
               <SplitForm />
          </CardContent>
      </Card>
    </div>
  );
}
