import { getTranslations } from 'next-intl/server';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';

interface ExchangesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ExchangesPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Exchanges | PerkX',
    description: 'View all available Exchanges and exchange offers',
  };
}

export default async function ExchangesPage({ params }: ExchangesPageProps) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <div className="img-bg">
        <Header />
        <div className="container py-5">
          <h1>Exchanges Page</h1>
          <p>This is a test Exchanges page - Locale: {locale}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
