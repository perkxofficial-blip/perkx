import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import PasswordInput from "@/components/public/login/PasswordInput";
import ForgotPasswordModal from "@/components/public/login/ForgotPasswordModal";
import {cookies} from "next/headers";
import {registerAction} from "./action";
interface RegisterPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('home', locale);
  if (!page) {
    return {
      title: 'Register | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}
function mapErrors(errors?: Array<{ field: string; message: string }>) {
  if (!errors) return {}
  return errors.reduce<Record<string, string>>((acc, err) => {
    acc[err.field] = err.message
    return acc
  }, {})
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const flashRaw = cookieStore.get('register')?.value;
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
  console.log(data)
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
                <h1>{t('register.title')}</h1>
                <p>{t('register.desc')}</p>
              </div>
              <form action={registerAction} aria-label="Register form">
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
                  defaultValue={data?.old?.email}
                  className={`form-control ${errorMap?.email ? 'is-invalid' : ''}`}
                />
                {errorMap?.email && (
                  <div className="invalid-feedback">
                    {t(errorMap?.email)}
                  </div>
                )}
              </div>

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
              <div className="mb-3">
                <label htmlFor="referralInput" className="form-label">
                  {t('register.referral_uid')}
                </label>
                <input
                  type="text"
                  id="referralInput"
                  name="referral_uid"
                  placeholder={t('register.referral_uid_placeholder')}
                  defaultValue={data?.old?.referral_user_id}
                  className={`form-control ${errorMap?.referral_user_id ? 'is-invalid' : ''}`}
                />
                {errorMap?.referral_user_id && (
                  <div className="invalid-feedback">
                    {t(errorMap?.referral_user_id)}
                  </div>
                )}
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
            <div className="col-md-3 col-lg-6">
            </div>
          </div>
        </div>
        <ForgotPasswordModal />
      </main>
    </>
  );
}
