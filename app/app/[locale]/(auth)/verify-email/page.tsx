import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";
import {resendAction} from "./action";
import {cookies} from "next/headers";
import ResendCountdown from "./ResendCountdown";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
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
async function verifyEmail(token: string | undefined) {
  const res = await fetch(
    `${API_BASE_URL}/auth/verify-email?token=${token}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  const result: any = await res.json();
  if (!result?.data?.status) {
    redirect(`/login`);
  }
  return result?.data
}
interface Props {
  searchParams: { token?: string }
}
export default async function VerifyEmailPage({ searchParams }: Props) {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const { token } = await searchParams
  const email: any = cookieStore.get('verify-email')?.value;
  const messageRaw: any = cookieStore.get('verify-email-message')?.value;
  let message: any;
  if (messageRaw) {
    try {
      message = JSON.parse(messageRaw);
    } catch {
      message = null;
    }
  }
  if (!token || !email) {
    redirect(`/login`);
  }
  const data = await verifyEmail(token);
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
               <h1>{t('verify_email.title')}</h1>
               <p>{t('verify_email.desc')}</p>
             </div>
              {typeof message?.status === 'boolean' && (
                message?.status ? (
                  <p className='text-info'>{t(message?.message)}</p>
                ) : (
                  <p className='text-danger'>{t(message?.message)}</p>
                )
              )}
              <form action={resendAction} aria-label="Resend form">
                <input type="hidden" name="email" defaultValue={email}/>
                <input type="hidden" name="token" defaultValue={token}/>
                <ResendCountdown expiredAt={data?.expired_at} btnText={t('verify_email.resend')}/>
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
