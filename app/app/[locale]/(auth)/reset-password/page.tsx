import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";
import {resetAction} from "./action";
import {cookies} from "next/headers";
import PasswordInput from "@/components/public/login/PasswordInput";
import SubmitButton from "@/components/public/login/SubmitButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function generateMetadata({ params }: {
  params: Promise<{
    locale: string;
  }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('reset-password', locale);

  if (!page) {
    return {
      title: 'Reset Password | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}
interface Props {
  searchParams: { token?: string }
}
function mapErrors(errors?: Array<{ field: string; message: string }>) {
  if (!errors) return {}
  return errors.reduce<Record<string, string>>((acc, err) => {
    acc[err.field] = err.message
    return acc
  }, {})
}
export default async function ResetPasswordPage({ searchParams }: Props) {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const { token } = await searchParams

  if (!token) {
    redirect(`/login`);
  }
  const flashRaw = cookieStore.get('reset')?.value;
  let data: {
    error?: string;
    success?: string;
    old?: Record<string, string>;
    errors?: any;
  } | null = null;

  if (flashRaw) {
    try {
      data = JSON.parse(flashRaw);
    } catch {
      data = null;
    }
  }
  const errorMap = mapErrors(data?.errors)
  return (
    <>
      <main className="login">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-1 col-lg-1"></div>
            <div className="col-md-8 col-lg-5 login-form">
             <div className="text-center">
               <Image
                 src="/images/logo-login.png"
                 alt={t('meta.home.title')}
                 width={168}
                 height={55}
                 priority
               />
               <h1>{t('reset_password.title')}</h1>
               <p>{t('reset_password.desc')}</p>
             </div>

              <form action={resetAction} aria-label="Resend form">
                <input type="hidden" name="token" defaultValue={token}/>
                <PasswordInput
                  name='password'
                  label={t('login.password')}
                  placeholder={t('login.password_placeholder')}
                  error={errorMap?.password ? t(errorMap?.password) : ''}
                />
                <PasswordInput
                  name='confirm_password'
                  label={t('register.confirm_password')}
                  placeholder={t('register.confirm_password')}
                  error={errorMap?.confirm_password ? t(errorMap?.confirm_password) : ''}
                />
                <SubmitButton
                  label={t('menu.login')}
                  watch={['password', 'confirm_password']}
                />
                <p className="text-center auth-footer">
                  <a href="/login" className="signup-link">
                    {' '}{t('verify_email.back_to_login')}
                  </a>
                </p>
              </form>
            </div>
            <div className="col-md-3 col-lg-6"></div>
          </div>
        </div>
      </main>
    </>
  );
}
