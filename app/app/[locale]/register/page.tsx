import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import PasswordInput from "@/components/public/login/PasswordInput";
import ForgotPasswordModal from "@/components/public/login/ForgotPasswordModal";
interface RegisterPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('login', locale);

  if (!page) {
    return {
      title: 'Login | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const t = await getTranslations();
  return (
    <>
      <main className="login">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5 login-form">
             <div className="text-center">
               <Image
                 src="/images/logo-login.png"
                 alt={t('meta.home.title')}
                 width={168}
                 height={55}
                 priority
               />
               <h1>{t('register.title')}</h1>
               <p>{t('register.desc')}</p>
             </div>
              <form action="/register" method="POST"  aria-label="Register form">
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">
                    {t('login.email')}
                  </label>
                  <input
                    type="email"
                    id="emailInput"
                    name="email"
                    className="form-control"
                    autoComplete="email"
                    required
                    placeholder={t('login.email_placeholder')}
                  />
                </div>

                <PasswordInput
                  name='password'
                  label={t('login.password')}
                  placeholder={t('login.password_placeholder')}
                />
                <PasswordInput
                  name='confirm_password'
                  label={t('register.confirm_password')}
                  placeholder={t('register.confirm_password')}
                />
                <div className="mb-3">
                  <label htmlFor="referralInput" className="form-label">
                    {t('register.referral_uid')}
                  </label>
                  <input
                    type="text"
                    id="referralInput"
                    name="referral_uid"
                    className="form-control"
                    placeholder={t('register.referral_uid_placeholder')}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-login w-100 mb-4"
                >
                  {t('register.submit_btn')}
                </button>
                <p className="text-center auth-footer">
                  {t('register.already_account')}
                  <a href="/login" className="signup-link">
                    {' '}   {t('register.sign_in')}
                  </a>
                </p>
              </form>
            </div>
            <div className="col-md-4 col-lg-7">
            </div>
          </div>
        </div>
        <ForgotPasswordModal />
      </main>
    </>
  );
}
