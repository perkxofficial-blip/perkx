import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const localeValue = await requestLocale;
  let locale: string = localeValue && locales.includes(localeValue as any)
    ? localeValue as string
    : defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});