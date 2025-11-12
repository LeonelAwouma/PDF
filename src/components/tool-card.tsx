import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type ToolCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
};

export function ToolCard({ href, icon, title, description }: ToolCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1">
        <CardHeader className="flex flex-col items-center justify-center text-center p-6">
          <div className="mb-4 text-primary transition-colors group-hover:text-accent">
            {icon}
          </div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
