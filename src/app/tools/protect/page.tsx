import { ProtectForm } from './protect-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function ProtectPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Protect PDF</CardTitle>
          <CardDescription className="text-md">
            Add a password and encrypt your PDF file to secure it. The
            process is done entirely in your browser for privacy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProtectForm />
        </CardContent>
      </Card>
    </div>
  );
}
