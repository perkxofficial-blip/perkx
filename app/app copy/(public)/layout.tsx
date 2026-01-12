import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perkx - Landing & User Portal',
  description: 'Responsive platform for users',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Public Layout - Responsive */}
      {/* Shared between Landing and User pages */}
      {children}
    </div>
  );
}
