import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata, generateStructuredData } from '@/lib/seo';
import PageTemplate from '@/components/common/PageTemplate';
import type { Metadata } from 'next';

interface AboutUsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AboutUsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('about-us', locale);

  if (!page) {
    return {
      title: 'About Us | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { locale } = await params;
  const page = await getPageBySlug('about-us', locale);

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

      <PageTemplate
        title={page.title}
        description={page.description}
        showMeta={true}
        updatedAt={page.updatedAt}
        viewCount={page.viewCount}
        locale={locale}
      >
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </PageTemplate>
    </>
  );
}
