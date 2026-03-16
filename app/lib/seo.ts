import type { Metadata } from 'next';

interface GenerateMetadataProps {
  locale: string;
}

export function generatePageMetadata({locale }: GenerateMetadataProps): Metadata {
  const title = 'Home | PerkX';
  const description = 'Learn more about PerkX and our mission';
  const canonicalUrl = `${process.env.FRONTEND_URL}/${locale}/home`;

  const openGraph = {
    title,
    description,
    type: 'article' as const,
    locale: locale,
    url: canonicalUrl
  };

  return {
    title,
    description,
    keywords: "PerkX, employee rewards, recognition, corporate perks, employee engagement",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: openGraph.title,
      description: openGraph.description,
    },
  };
}

export function generateStructuredData(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Home | PerkX',
    description: 'Learn more about PerkX and our mission',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/home`,
    inLanguage: locale,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
}
