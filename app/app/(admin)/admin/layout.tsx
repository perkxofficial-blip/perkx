'use client';

import { usePathname } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login page with AdminLayoutWrapper
  if (pathname?.includes('/login')) {
    return <>{children}</>;
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
