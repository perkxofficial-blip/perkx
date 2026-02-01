'use client';

import { usePathname } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap auth pages with AdminLayoutWrapper
  const isAuthPage = pathname?.includes('/login') ||
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/reset-password');
  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
