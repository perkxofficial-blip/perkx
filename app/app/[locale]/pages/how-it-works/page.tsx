import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata, generateStructuredData } from '@/lib/seo';
import PageTemplate from '@/components/common/PageTemplate';
import type { Metadata } from 'next';

interface HowItWorksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('how-it-works', locale);

  if (!page) {
    return {
      title: 'How It Works | PerkX',
      description: 'Learn how PerkX cashback rewards work',
    };
  }

  return generatePageMetadata({ page, locale });
}

export default async function HowItWorksPage({ params }: HowItWorksPageProps) {
  const { locale } = await params;
  const page = await getPageBySlug('how-it-works', locale);

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
