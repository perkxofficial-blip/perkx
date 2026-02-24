import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {headers} from 'next/headers'
export default getRequestConfig(async ({requestLocale}) => {
  const host = (await headers()).get('host') || '';

  const subdomain = host.split('.')[0];
  let locale: string = routing.defaultLocale;
  if (routing.locales.includes(subdomain as any)) {
    locale = subdomain;
  }
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
