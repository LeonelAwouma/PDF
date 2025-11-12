import { CompareForm } from './compare-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function ComparePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">PDF Comparison Tool</CardTitle>
          <CardDescription className="text-md">
            Upload two PDF files to compare their content and quality. Our AI
            will highlight the differences and assess quality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompareForm />
        </CardContent>
      </Card>
    </div>
  );
}
