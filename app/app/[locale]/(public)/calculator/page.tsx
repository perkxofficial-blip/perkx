import { getTranslations } from 'next-intl/server';
import Header from '@/components/public/Header';
import type { Metadata } from 'next';
import { getAllExchanges, Exchange } from '@/services/api/public/exchange';
import CalculatorCard from '@/components/public/CalculatorCard';

interface ExchangesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ExchangesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('calculator');

  return {
    title: t("meta.title") || 'Calculator | PerkX',
    description: t("meta.description") || 'View Calculator Page',
  };
}

export default async function CalculatorPage({ params }: ExchangesPageProps) {
  const { locale } = await params;
  const t = await getTranslations('calculator');
  
  let exchanges: Exchange[] = [];
  try {
    exchanges = await getAllExchanges();
  } catch (error) {
    console.error('Error fetching exchanges:', error);
  }

  return (
    <>
      <div className="img-bg-calculator">
        <Header />
        <section className="banner-section" aria-label="Calculator Hero Section">
          <div className="container-fluid">
            <div className="row position-relative justify-content-center">
              <div className="col-12 text-center calculator-hero-content">
                <h1 className="calculator-hero-title">
                  {t('hero_title_part1')}<span className="gradient-text">{t('hero_title_gradient')}</span>
                </h1>
                <p className="calculator-hero-subtitle">
                  {t('hero_subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className='calculator-section position-relative'>
        <div className="bg-bottom-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="867"
            height="742"
            viewBox="0 0 867 742"
            fill="none"
          >
            <defs>
              <radialGradient id="bg-radial-bottom-left" cx="51.28%" cy="48.67%" r="46%">
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

        <div className="container calculator-container">
          <div className="row justify-content-center">
            <div className="col-12">
              <CalculatorCard exchanges={exchanges} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
