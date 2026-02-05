import type { Metadata } from 'next';
import type { Page } from '@/services/api/pages';

interface GenerateMetadataProps {
  page: Page;
  locale: string;
}

export function generatePageMetadata({ page, locale }: GenerateMetadataProps): Metadata {
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || page.description || '';
  const canonicalUrl = page.canonicalUrl || `${process.env.FRONTEND_URL}/${locale}/${page.slug}`;

  const openGraph = {
    title: page.ogTitle || title,
    description: page.ogDescription || description,
    type: 'article' as const,
    locale: locale,
    url: canonicalUrl,
    ...(page.ogImage && {
      images: [
        {
          url: page.ogImage,
          alt: page.ogTitle || title,
        },
      ],
    }),
  };

  return {
    title,
    description,
    keywords: page.metaKeywords?.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: openGraph.title,
      description: openGraph.description,
      ...(page.ogImage && {
        images: [page.ogImage],
      }),
    },
  };
}

export function generateStructuredData(page: Page, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: page.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/pages/${page.slug}`,
    inLanguage: locale,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
  };
}
