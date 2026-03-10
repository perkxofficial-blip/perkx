import Header from "@/components/public/Header";
import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';
import Image from "next/image";
import '@/styles/public/help-center.scss';

interface AboutUsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AboutUsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('help-center');
  
  return {
    title: t("meta.title") || 'Help Center | PerkX',
    description: t("meta.description") || 'Find answers and support at PerkX Help Center',
  };
}

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('help-center');

  return (
    <>
      <div className="page-img-bg help-center-page">
        <Header />
        {/* Hero Section */}
        <section className="banner-section" aria-label="Hero Section - Help Center">
          <div className="container-fluid">
            <div className="row position-relative">
              <div className="get-started col-md-12 text-center">
                <h1 className="gradient-title page-header-lv1">{t('hero.title')}</h1>
                <p>{t('hero.subtitle')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
