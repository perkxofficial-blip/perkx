import type { Metadata } from 'next';
import '../../admin.css'

export const metadata: Metadata = {
    title: 'Admin Reset Password',
    description: 'Admin Reset Password',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return children;
}
