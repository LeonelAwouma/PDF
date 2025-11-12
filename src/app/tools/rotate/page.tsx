import { RotateForm } from './rotate-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function RotatePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Rotate PDF</CardTitle>
          <CardDescription className="text-md">
            Select the pages you want to rotate and choose the angle. The
            rotation will be applied permanently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RotateForm />
        </CardContent>
      </Card>
    </div>
  );
}
