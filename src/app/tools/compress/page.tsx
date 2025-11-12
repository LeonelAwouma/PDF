import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { CompressForm } from './compress-form';

export default function CompressPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Compresser un PDF</CardTitle>
          <CardDescription className="text-md">
            Réduisez la taille de vos fichiers PDF directement dans votre navigateur. Choisissez un niveau de compression et obtenez un fichier optimisé en quelques secondes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompressForm />
        </CardContent>
      </Card>
    </div>
  );
}
