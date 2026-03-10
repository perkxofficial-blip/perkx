import Header from "@/components/public/Header";
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
                <h1 className="page-header-lv1">
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
      <section className="steps-section position-relative mt--30px">
        <div className="container">
          {/* Step 1 */}
          <div className="step-item">
            <div className="step-content show-mb">
              <p className="step-title">{t('steps.step1.title')}</p>
              <p>{t('steps.step1.description')}</p>
            </div>
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
            <div className="step-content hidden-mb">
              <p className="step-title">{t('steps.step1.title')}</p>
              <p>{t('steps.step1.description')}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-item reverse">
            <div className="step-content show-mb">
              <p className="step-title">{t('steps.step2.title')}</p>
              <p>{t('steps.step2.description')}</p>
            </div>
            <div className="step-image">
              <Image
                src="/images/step2-link-exchange.png"
                alt={t('steps.step2.title')}
                width={550}
                height={383}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="step-content hidden-mb">
              <p className="step-title">{t('steps.step2.title')}</p>
              <p>{t('steps.step2.description')}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-item">
            <div className="step-content show-mb">
              <p className="step-title">{t('steps.step3.title')}</p>
              <p>{t('steps.step3.description')}</p>
            </div>
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
            <div className="step-content hidden-mb">
              <p className="step-title">{t('steps.step3.title')}</p>
              <p>{t('steps.step3.description')}</p>
            </div>
          </div>
        </div>
        {/* Background Decorations */}
        <div className="bg-bottom-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="867"
            height="742"
            viewBox="0 0 867 742"
            fill="none"
          >
            <defs>
              <radialGradient id="bg-radial-bottom-left" cx="44.28%" cy="58.67%" r="56%">
                <stop offset="7.21%" stopColor="#F579E0" stopOpacity="0.5" />
                <stop offset="51.44%" stopColor="#251611" stopOpacity="0.48" />
                <stop offset="100%" stopColor="#000" />
              </radialGradient>
            </defs>

            <path
              d="M86.7814 1229.83C517.408 1229.83 866.5 954.526 866.5 614.917C866.5 275.308 517.408 0 86.7814 0C-343.845 0 -692.937 275.308 -692.937 614.917C-692.937 954.526 -343.845 1229.83 86.7814 1229.83Z"
              fill="url(#bg-radial-bottom-left)"
              opacity="0.7"
              style={{ mixBlendMode: "screen" }}
            />
          </svg>
        </div>
      </section>
    </>
  );
}
