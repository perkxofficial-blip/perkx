'use client';

import { useTranslations } from 'next-intl';
import { logoutAction } from './logoutAction';

export default function LogoutButton() {
  const t = useTranslations();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <button onClick={handleLogout} className="btn btn-register">
      {t("menu.logout")}
    </button>
  );
}
