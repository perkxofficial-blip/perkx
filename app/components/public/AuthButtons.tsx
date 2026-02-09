import { cookies } from 'next/headers';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import LogoutButton from './LogoutButton';

export default async function AuthButtons() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isAuthenticated = !!token;
  const t = await getTranslations();

  if (isAuthenticated) {
    return (
      <>
        <Link href="/user/profile" className="btn btn-login">
          {t("menu.profile")}
        </Link>
        <LogoutButton />
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="btn btn-login btn-common">
        {t("menu.login")}
      </Link>
      <Link href="/register" className="btn btn-register btn-common">
        {t("page.register")}
      </Link>
    </>
  );
}
