'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/routing';
import {useTransition} from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, {locale: newLocale as any});
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('en')}
        disabled={isPending}
        className={`px-3 py-1 rounded transition-colors ${
          locale === 'en' 
            ? 'bg-blue-600 text-white font-bold' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ko')}
        disabled={isPending}
        className={`px-3 py-1 rounded transition-colors ${
          locale === 'ko' 
            ? 'bg-blue-600 text-white font-bold' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        한국어
      </button>
    </div>
  );
}
