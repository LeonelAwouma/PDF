import { CompressForm } from './compress-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function CompressPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Compress PDF</CardTitle>
          <CardDescription className="text-md">
            Reduce the file size of your PDF documents. Choose a compression level that suits your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompressForm />
        </CardContent>
      </Card>
    </div>
  );
}
