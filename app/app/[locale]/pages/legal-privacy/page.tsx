import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata, generateStructuredData } from '@/lib/seo';
import PageTemplate from '@/components/common/PageTemplate';
import type { Metadata } from 'next';

interface LegalPrivacyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: LegalPrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('legal-privacy', locale);

  if (!page) {
    return {
      title: 'Privacy Policy | PerkX',
      description: 'Read our privacy policy and data protection practices',
    };
  }

  return generatePageMetadata({ page, locale });
}

export default async function LegalPrivacyPage({ params }: LegalPrivacyPageProps) {
  const { locale } = await params;
  const page = await getPageBySlug('legal-privacy', locale);

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
        className="legal-content"
      >
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </PageTemplate>
    </>
  );
}
