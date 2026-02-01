import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import PasswordInput from "@/components/public/login/PasswordInput";
import ForgotPasswordModal from "@/components/public/login/ForgotPasswordModal";
import {loginAction} from "./action";
import {cookies} from "next/headers";
import SubmitButton from "@/components/public/login/SubmitButton";
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

function mapErrors(errors?: Array<{ field: string; message: string }>) {
  if (!errors) return {}
  return errors.reduce<Record<string, string>>((acc, err) => {
    acc[err.field] = err.message
    return acc
  }, {})
}
export default async function LoginPage({ params }: LoginPageProps) {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const flashRaw = cookieStore.get('login')?.value;
  let data: {
    message?: string;
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
  const messageRaw: any = cookieStore.get('login-message')?.value;
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
               <h1>{t('menu.login')}</h1>
               <p>{t('login.desc')}</p>
             </div>
              {typeof message?.status === 'boolean' && (
                message?.status ? (
                  <p className='text-info'>{t(message?.message)}</p>
                ) : (
                  <p className='text-danger'>{t(message?.message)}</p>
                )
              )}
              { data?.message && (<p className='text-danger'>{t(data?.message)}</p>)}
              <form action={loginAction}  aria-label="Login form">
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
                <div className="text-start mb-3">
                  <a
                    href='/forgot-password'
                    className="btn btn-link p-0"
                  >
                    {t('login.forgot_password')}
                  </a>
                </div>
                <SubmitButton
                  label={t('menu.login')}
                  watch={['email', 'password']}
                />

                <p className="text-center auth-footer">
                  {t('login.create_account')}
                  <a href="/register" className="signup-link">
                    {' '}{t('login.sign_up')}
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
