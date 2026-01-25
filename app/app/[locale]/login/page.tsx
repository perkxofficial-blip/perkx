import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import PasswordInput from "@/components/public/login/PasswordInput";
import ForgotPasswordModal from "@/components/public/login/ForgotPasswordModal";
interface LoginPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
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

export default async function LoginPage({ params }: LoginPageProps) {
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
               <h1>{t('menu.login')}</h1>
               <p>{t('login.desc')}</p>
             </div>
              <form action="/login" method="POST"  aria-label="Login form">
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
                <div className="text-start mb-3">
                  <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#forgotModal"
                    className="btn btn-link p-0"
                  >
                    {t('login.forgot_password')}
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn btn-login w-100 mb-4"
                >
                  {t('menu.login')}
                </button>
                <p className="text-center auth-footer">
                  {t('login.create_account')}
                  <a href="/register" className="signup-link">
                    {' '}{t('login.sign_up')}
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
