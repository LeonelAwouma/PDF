import { MergeForm } from './merge-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ArrowRight } from 'lucide-react';

export default function MergePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <MergeForm />
      </div>
      <div className="lg:col-span-1 sticky top-24">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Merge PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/20 border-l-4 border-accent text-accent-foreground p-4 rounded-md">
              <div className="flex">
                <Info className="h-5 w-5 mr-3" />
                <div className="text-sm">
                  To change the order of your PDFs, drag and drop the files as you want.
                </div>
              </div>
            </div>
            <Button
              type="submit"
              form="merge-form"
              className="w-full text-lg py-6"
              size="lg"
            >
              Merge PDF
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
