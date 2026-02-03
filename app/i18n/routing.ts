import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ko', 'zh', 'ja', 'id', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // '/en' optional, other locales required
});

export const {Link, redirect, usePathname, useRouter} = 
  createNavigation(routing);
