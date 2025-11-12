import { MergeForm } from './merge-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function MergePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Merge PDF</CardTitle>
          <CardDescription className="text-md">
            Combine multiple PDF files into a single, unified document. Upload your files in the desired order and click merge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MergeForm />
        </CardContent>
      </Card>
    </div>
  );
}
