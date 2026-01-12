import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perkx Admin - Management Portal',
  description: 'Admin management portal - non-responsive',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Layout - Fixed width, non-responsive */}
      {children}
    </div>
  );
}
