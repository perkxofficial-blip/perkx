import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {resendOtpAction, verifyOtpAction} from "./action";
import {cookies} from "next/headers";
import OtpInput from "@/app/[locale]/(auth)/verify-otp/OtpInput";
import {redirect} from "next/navigation";
import ResendCountdown from "./ResendCountdown";

export async function generateMetadata({ params }: {
  params: Promise<{
    locale: string;
  }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('verify-email', locale);

  if (!page) {
    return {
      title: 'Verify Email | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}
export default async function VerifyOtpPage() {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const email: any = cookieStore.get('verify-email')?.value;
  const message = cookieStore.get('verify-email-message')?.value;

  if (!email) {
    redirect(`/login`);
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
               <h1>{t('verify_email.title_otp')}</h1>
               <p>{t('verify_email.desc_otp')}</p>
             </div>
              {message && (
                <p className='text-danger'>{t(message)}</p>
              )}
              <form action={verifyOtpAction} aria-label="Verify form">
                <input type="hidden" name="email" defaultValue={email}/>
                <OtpInput/>
                <button
                  type="submit"
                  className="btn btn-login w-100 mb-4 btn-otp-submit"
                >
                  {t('verify_email.confirm')}
                </button>
              </form>
              <form action={resendOtpAction} aria-label="Resend form">
                <input type="hidden" name="email" defaultValue={email}/>
               <div className="text-end">
                 <ResendCountdown />
               </div>
              </form>
              <p className="text-center auth-footer mt-4">
                <a href="/login" className="signup-link">
                  {' '}{t('verify_email.back_to_login')}
                </a>
              </p>
            </div>
            <div className="col-md-3 col-lg-6"></div>
          </div>
        </div>
      </main>
    </>
  );
}
