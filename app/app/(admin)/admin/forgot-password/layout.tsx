import type { Metadata } from 'next';
import '../../admin.css'

export const metadata: Metadata = {
    title: 'Admin Forgot Password',
    description: 'Admin Forgot Password',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return children;
}
