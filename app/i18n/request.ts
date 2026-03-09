import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {headers} from 'next/headers'

export default getRequestConfig(async ({requestLocale}) => {
  const h = await headers();
  const localeValue = await requestLocale;
  // Detect locale from host header (subdomain-based)
  const host = h.get('host') || '';
  const hostname = host.replace(/^www\./, '').split(':')[0];
  const validLocales = ['ko', 'zh', 'ja', 'id', 'es'];
  
  let locale: string | null = routing.defaultLocale;
  if (hostname.includes('localhost')) {
    // For localhost: ko.localhost:3000
    const parts = hostname.split('.');
    if (parts.length > 1 && validLocales.includes(parts[0])) {
      locale = parts[0];
    }
  } else {
    // For production: ko.perkx.co
    const parts = hostname.split('.');
    if (parts.length > 2 && validLocales.includes(parts[0])) {
      locale = parts[0];
    }
  }
  if (locale != localeValue) {
    locale = locale || localeValue as string;
  }
  // Use default if not found or invalid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
