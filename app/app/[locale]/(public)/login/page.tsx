import { getPageBySlug } from '@/services/api/pages';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
interface LoginPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('login', locale);

  if (!page) {
    return {
      title: 'Login | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}

export default async function LoginPage({ params }: LoginPageProps) {
  return (
    <>
      Lohin
    </>
  );
}
