import type { ReactNode } from 'react';

export default function ExchangesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}
