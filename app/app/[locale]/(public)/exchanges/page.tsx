import { getTranslations } from 'next-intl/server';
import Header from '@/components/public/Header';
import type { Metadata } from 'next';
import { getAllExchanges, Exchange, ExchangeProduct } from '@/services/api/public/exchange';
import Image from 'next/image';
import PartnerExchangesTable from '@/components/public/PartnerExchangesTable';

interface ExchangesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ExchangesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('exchanges');

  return {
    title: t("meta.title") || 'Exchanges | PerkX',
    description: t("meta.description") || 'View all available Exchanges and exchange offers',
  };
}

interface ExchangeRowProps {
  exchange: Exchange;
  t: any;
}

export default async function ExchangesPage({ params }: ExchangesPageProps) {
  const { locale } = await params;
  const t = await getTranslations('exchanges');
  
  let exchanges: Exchange[] = [];
  try {
    exchanges = await getAllExchanges();
  } catch (error) {
    console.error('Error fetching exchanges:', error);
  }

  return (
    <>
      <div className="img-bg-exchanges">
        <Header />
        <section className="banner-section" aria-label="Exchanges Hero Section">
          <div className="container-fluid">
            <div className="row position-relative">
              <div className="exchange-avatar exchange-avatar-binance" aria-hidden="true"></div>
              <div className="exchange-avatar exchange-avatar-bybit" aria-hidden="true"></div>
              <div className="exchange-avatar exchange-avatar-bingx" aria-hidden="true"></div>
              <div className="exchange-avatar exchange-avatar-bitget" aria-hidden="true"></div>
              <div className="exchange-avatar exchange-avatar-okx" aria-hidden="true"></div>
              <div className="exchange-avatar exchange-avatar-weex" aria-hidden="true"></div>

              <div className="bitcoin-left col-md-3" aria-hidden="true"></div>

              <div className="get-started col-md-6 text-center">
                <h2 className='exchange-hero_title'>{t('hero_title_part1')}</h2>
                <h1><span className="exchange-hero_title_gradient">{t('hero_title_gradient')}</span></h1>
                <p>{t('hero_subtitle')}</p>
                <a href="/register" className="get-started-now btn-get-started d-inline-flex align-items-center gap-2">
                  {t('get_started')}
                  <Image
                    src="/images/arrow-right-s-line.svg"
                    alt="arrow right"
                    width={20}
                    height={20}
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div className="bitcoin-right col-md-3" aria-hidden="true"></div>
            </div>
          </div>
        </section>
      </div>

      <section className='partner-exchanges position-relative'>
        <div className="bg-top-right">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="793"
            height="737"
            viewBox="0 0 793 737"
            fill="none"
          >
            <defs>
              <radialGradient id="bg-radial" cx="51.28%" cy="48.67%" r="46%">
                <stop offset="7.21%" stopColor="#2C757F" />
                <stop offset="51.44%" stopColor="#251611" stopOpacity="0.48" />
                <stop offset="100%" stopColor="#000" />
              </radialGradient>
            </defs>

            <path
              d="M739.254 737.005C1147.53 737.005 1478.51 475.984 1478.51 154C1478.51 -167.985 1147.53 -429.005 739.254 -429.005C330.975 -429.005 0 -167.985 0 154C0 475.984 330.975 737.005 739.254 737.005Z"
              fill="url(#bg-radial)"
              opacity="0.7"
              style={{ mixBlendMode: "screen" }}
            />
          </svg>
        </div>
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

        <div className="container">
          <div className="position-relative">
            <div className="pe-table">
              <PartnerExchangesTable exchanges={exchanges} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
