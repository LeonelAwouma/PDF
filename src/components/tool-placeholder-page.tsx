import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { HardHat } from 'lucide-react';

type ToolPlaceholderPageProps = {
  title: string;
  description: string;
};

export function ToolPlaceholderPage({
  title,
  description,
}: ToolPlaceholderPageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription className="text-md">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-background">
            <HardHat className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">
              Feature Under Construction
            </h3>
            <p className="text-muted-foreground mt-2">
              We're working hard to bring this tool to you. Please check back
              later!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
