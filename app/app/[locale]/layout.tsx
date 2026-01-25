import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
import '@/styles/public/public.css'
import BootstrapProvider from "@/components/public/BootstrapProvider";
import Script from "next/script";
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <BootstrapProvider/>
        {children}
      <Script
        src="/js/header-observer.js"
        strategy="afterInteractive"
      />
    </NextIntlClientProvider>
  );
}
