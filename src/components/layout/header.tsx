import Link from 'next/link';
import { FileHeart, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderProps = {
  showBackButton?: boolean;
};

export function Header({ showBackButton = false }: HeaderProps) {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to Home</span>
              </Link>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-lg shadow-md">
              <FileHeart className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              PDFZero
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
