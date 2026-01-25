import type { ReactNode } from 'react';

export default function CampaignsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Optional: Add campaigns-specific navigation or sidebar here */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
