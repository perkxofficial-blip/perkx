import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('page');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        {t('notFound')}
      </p>
    </div>
  );
}
