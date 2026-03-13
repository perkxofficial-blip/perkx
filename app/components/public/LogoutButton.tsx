'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/auth';

export default function LogoutButton() {
  const t = useTranslations();
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies from client-side (cookies are httpOnly: false)
    auth.clearUserToken();
    // Redirect to home page
    router.push('/');
  };

  return (
    <button onClick={handleLogout} className="btn btn-register">
      {t("menu.logout")}
    </button>
  );
}
