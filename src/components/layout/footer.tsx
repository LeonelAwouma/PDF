"use client";

import { useState, useEffect } from 'react';

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {year} PDFZero. All rights reserved.</p>
      </div>
    </footer>
  );
}
