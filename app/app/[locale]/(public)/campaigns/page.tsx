import { getTranslations } from 'next-intl/server';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';

interface CampaignsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CampaignsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Campaigns | PerkX',
    description: 'View all available campaigns and exchange offers',
  };
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <div className="img-bg">
        <Header />
        <div className="container py-5">
          <h1>Campaigns Page</h1>
          <p>This is a test campaigns page - Locale: {locale}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
