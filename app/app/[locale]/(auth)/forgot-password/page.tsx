import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {cookies} from "next/headers";
import {forgotPasswordAction} from "./action";
import SubmitButton from "@/components/public/login/SubmitButton";

export async function generateMetadata({ params }: {
  params: Promise<{
    locale: string;
  }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('forgot-password', locale);

  if (!page) {
    return {
      title: 'Forgot Password | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}
export default async function ForgotPasswordPage() {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const messageRaw: any = cookieStore.get('forgot-password-message')?.value;
  let message: any;
  if (messageRaw) {
    try {
      message = JSON.parse(messageRaw);
    } catch {
      message = null;
    }
  }
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
                <h1>{t('forgot_password.title')}</h1>
                <p>{t('forgot_password.desc')}</p>
              </div>
              {typeof message?.status === 'boolean' && (
                message?.status ? (
                  <p className='text-info'>{t(message?.message)}</p>
                ) : (
                  <p className='text-danger'>{t(message?.message)}</p>
                )
              )}
              <form action={forgotPasswordAction} aria-label="Resend form">
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">
                    {t('login.email')}
                  </label>
                  <input
                    type="email"
                    id="emailInput"
                    name="email"
                    autoComplete="email"
                    placeholder={t('login.email_placeholder')}
                    className={`form-control`}
                  />
                </div>
                <SubmitButton
                  label={t('forgot_password.btn')}
                  watch={['email']}
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
