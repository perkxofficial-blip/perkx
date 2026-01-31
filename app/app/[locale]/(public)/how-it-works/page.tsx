import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';
import Image from "next/image";
import '@/styles/public/how-it-works.scss';

interface HowItWorksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('how-it-works');
  
  return {
    title: t("meta.title") || 'How It Works | PerkX',
    description: t("meta.description") || 'Learn how PerkX cashback rewards work',
  };
}

export default async function HowItWorksPage({ params }: HowItWorksPageProps) {
  const { locale } = await params;
  const t = await getTranslations('how-it-works');

  return (
    <>
      <div className="page-img-bg how-it-works-page">
        <Header />
        {/* Hero Section */}
        <section className="banner-section" aria-label="Hero Section - How It Works">
          <div className="container-fluid">
            <div className="row position-relative">
              <div className="get-started col-md-12 text-center">
                <h1>
                  <span className="regular-text">{t('hero.title_part1')}</span>
                  <span className="gradient-text">{t('hero.title_gradient')}</span>
                </h1>
                <p>{t('hero.subtitle')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Main Content Section - Steps */}
      <section className="steps-section position-relative">
        <div className="container">
          {/* Step 1 */}
          <div className="step-item">
            <div className="step-image">
              <Image
                src="/images/step1-register.png"
                alt={t('steps.step1.title')}
                width={550}
                height={383}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="step-content">
              <h3>{t('steps.step1.title')}</h3>
              <p>{t('steps.step1.description')}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-item reverse">
            <div className="step-image">
              <Image
                src="/images/step2-linked-exchange.png"
                alt={t('steps.step2.title')}
                width={550}
                height={383}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="step-content">
              <h3>{t('steps.step2.title')}</h3>
              <p>{t('steps.step2.description')}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-item">
            <div className="step-image">
              <Image
                src="/images/step3-start-trading.png"
                alt={t('steps.step3.title')}
                width={550}
                height={383}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="step-content">
              <h3>{t('steps.step3.title')}</h3>
              <p>{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
