import { SplitForm } from './split-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ArrowRight } from 'lucide-react';

export default function SplitPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
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
      <div className="lg:col-span-1 sticky top-24">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Split Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-accent/20 border-l-4 border-accent text-accent-foreground p-4 rounded-md">
              <div className="flex">
                <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  Enter page numbers or ranges separated by commas. For example, <span className="font-semibold">1, 3, 5-8</span>.
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
             <Button
              type="submit"
              form="split-form"
              className="w-full text-lg py-6"
              size="lg"
            >
              Split PDF
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
