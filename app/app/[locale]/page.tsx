import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getAllPages } from '@/services/api/pages';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const pages = await getAllPages(locale);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('home')}</h1>

      {pages.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Pages</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/${locale}/pages/${page.slug}`}
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{page.title}</h3>
                {page.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {page.description}
                  </p>
                )}
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {t('readMore')} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
