import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToolCard } from '@/components/tool-card';
import {
  Combine,
  Split,
  FileArchive,
  RotateCw,
  Replace,
  Lock,
  Unlock,
  ScanText,
  Wrench,
  GitCompareArrows,
  PenSquare,
} from 'lucide-react';

const tools = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one single document.',
    icon: <Combine className="w-8 h-8" />,
    href: '/tools/merge',
  },
  {
    title: 'Split PDF',
    description: 'Extract one or more pages from your PDF.',
    icon: <Split className="w-8 h-8" />,
    href: '/tools/split',
  },
  {
    title: 'Compress PDF',
    description: 'Reduce the file size of your PDF documents.',
    icon: <FileArchive className="w-8 h-8" />,
    href: '/tools/compress',
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate your PDF pages as you need.',
    icon: <RotateCw className="w-8 h-8" />,
    href: '/tools/rotate',
  },
  {
    title: 'Convert Files',
    description: 'Convert PDFs to and from various formats.',
    icon: <Replace className="w-8 h-8" />,
    href: '/tools/convert',
  },
  {
    title: 'Protect PDF',
    description: 'Add a password and encrypt your PDF file.',
    icon: <Lock className="w-8 h-8" />,
    href: '/tools/protect',
  },
  {
    title: 'Unlock PDF',
    description: 'Remove password and security from your PDF.',
    icon: <Unlock className="w-8 h-8" />,
    href: '/tools/unlock',
  },
  {
    title: 'OCR PDF',
    description: 'Convert scanned documents into editable PDFs.',
    icon: <ScanText className="w-8 h-8" />,
    href: '/tools/ocr',
  },
  {
    title: 'Repair PDF',
    description: 'Recover data and fix corrupted PDF files.',
    icon: <Wrench className="w-8 h-8" />,
    href: '/tools/repair',
  },
  {
    title: 'Compare PDFs',
    description: 'Compare two PDFs to see the differences.',
    icon: <GitCompareArrows className="w-8 h-8" />,
    href: '/tools/compare',
  },
  {
    title: 'Annotate PDF',
    description: 'Highlight, redact, and add notes to your PDF.',
    icon: <PenSquare className="w-8 h-8" />,
    href: '/tools/annotate',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Your All-in-One PDF Toolkit
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Easily merge, split, compress, convert, and secure your PDF files.
              Powerful tools, simple interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.title}
                href={tool.href}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
