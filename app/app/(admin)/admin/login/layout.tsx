import type { Metadata } from 'next';
import '../../admin.css'

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Admin Login',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
