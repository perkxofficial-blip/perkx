import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata, generateStructuredData } from '@/lib/seo';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug, locale);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return generatePageMetadata({ page, locale });
}

export default async function PageDetail({ params }: PageProps) {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug, locale);

  if (!page) {
    notFound();
  }

  const structuredData = generateStructuredData(page, locale);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Page Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          {page.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {page.description}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <time dateTime={page.updatedAt}>
              {new Date(page.updatedAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span className="mx-2">•</span>
            <span>{page.viewCount} views</span>
          </div>
        </header>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </>
  );
}
