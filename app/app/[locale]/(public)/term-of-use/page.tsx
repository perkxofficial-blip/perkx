import Header from "@/components/public/Header";
import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';
import '@/styles/public/terms-of-use.scss';

interface AboutUsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AboutUsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('terms-of-use');
  
  return {
    title: t("meta.title") || 'Terms of Use | PerkX',
    description: t("meta.description") || 'Read the terms of use for PerkX',
  };
}

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('terms-of-use');

  return (
    <>
      <div className="page-img-bg terms-of-use-page">
        <Header />
        {/* Hero Section */}
        <section className="banner-section" aria-label="Hero Section - Terms of Use">
          <div className="container-fluid">
            <div className="row position-relative">
              <div className="get-started col-md-12 text-center">
                <h1 className="gradient-title">{t('hero.title')}</h1>
                <p>{t('hero.subtitle')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
