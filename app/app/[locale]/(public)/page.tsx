import Header from "@/components/public/Header";
import PartnerSection from "@/components/public/PartnerSection";
import Image from "next/image";
import type { Metadata } from 'next';
import { getTranslations } from "next-intl/server";
import CampaignSection from "@/components/public/CampaignSection";
import PartnerExchangesTable from "@/components/public/PartnerExchangesTable";
import {getAllExchanges, Exchange, ExchangeSlide} from "@/services/api/public/exchange";
import { Campaign, getFeaturedCampaigns } from '@/services/api/public/campaign';
import PartnerExchangesMobileTable from "@/components/public/PartnerExchangesMobileTable";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}
export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('home');
  
  return {
    title: t("meta.title") || 'Home | PerkX',
    description: t("meta.description") || 'Maximize your trading rebates on global exchanges with PerkX. A professional cashback platform built for high-volume traders.',
  };
}

async function getLandingData() {
  const result: {
    exchanges: Exchange[],
    exchangesForSlide: ExchangeSlide[],
    campaigns: Campaign[],
  } = {
    exchanges: [],
    exchangesForSlide: [],
    campaigns: [],
  };

  try {
    const exchanges = await getAllExchanges();
    if (exchanges) { 
      result.exchanges = exchanges.slice(0, 5);
      result.exchangesForSlide = exchanges.map(exchange => ({
        name: exchange.name,
        logo_url: exchange.logo_url, // Assuming logo_url is derived from signup link; adjust as necessary
      }));
    }
  } catch {
    // Handle errors silently
  }

  try {
    const campaigns = await getFeaturedCampaigns();
    if (campaigns) { 
      result.campaigns = campaigns;
    }
  } catch {
    // Handle errors silently
  }
  return result;
}

export default async function LandingPage() {
  const data = await getLandingData();
  const t = await getTranslations();
  return (
    <>
      <div className="img-bg">
        <Header/>
        <section className="banner-section" aria-label="Hero Section - Trade Global Market">
          <div className="container-fluid">
            <div className="row position-relative">
              {/* Decorative coins */}
              <Image
                src="/images/coin1.png"
                className="coin coin-1"
                alt={t("home.coin")}
                width={100}
                height={50}
                aria-hidden="true"
                priority={false}
              />
              <Image
                src="/images/coin1.png"
                className="coin coin-2"
                alt={t("home.coin")}
                width={162}
                height={50}
                aria-hidden="true"
              />
              <Image
                src="/images/coin2.png"
                className="coin coin-3"
                alt={t("home.coin")}
                width={170}
                height={50}
                aria-hidden="true"
              />
              <Image
                src="/images/coin1.png"
                className="coin coin-4"
                alt={t("home.coin")}
                width={105}
                height={50}
                aria-hidden="true"
              />

              <div className="bitcoin-left col-md-3" aria-hidden="true"></div>

              <div className="get-started col-md-6 text-center">
                <h2>{t("home.intro_1")}</h2>
                <h1>{t("home.intro_2")}</h1>
                <p>
                  {t("home.hero_section_description")}
                </p>

                <div className="mt-3">
                  <a
                    href="/register"
                    className="btn btn-get-started d-inline-flex align-items-center"
                  >
                    <span>{t("home.get_started_now")}</span>
                    <Image
                      src="/images/icon/arrow-right-s-line.svg"
                      alt={`${t("home.get_started_now")} icon`}
                      width={16}
                      height={16}
                      className="ms-2"
                    />
                  </a>
                </div>
              </div>

              <div className="bitcoin-left col-md-3" aria-hidden="true"></div>
            </div>
          </div>

          {/* Partner Section (Owl Carousel) */}
          <PartnerSection exchanges={data.exchangesForSlide || []} />
        </section>
      </div>
      <section className="how-perk-work">
        <div className="work-bg"></div>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center how-perk-work-title">
              <h2>
                {t.rich('home.how_perkx_works', {
                  perkx: (chunks) => (
                    <span className="perkx">{chunks}</span>
                  ),
                })}
              </h2>
              <p>{t('home.how_perkx_works_description')}</p>
            </div>
          </div>
          <div className="row justify-content-center align-items-center position-relative">
            <div className="col-md-6 col-md-6 d-flex justify-content-end">
              <Image
                src="/images/work1.png"
                alt={t('home.how_perkx_works_description')}
                width={564}
                height={479}
                priority
              />
            </div>
            <div className="col-md-6 timeline-wrapper">
              <Image
                className="w-coin w-coin1"
                src="/images/w-coin1.png"
                alt={`${t('home.coin')}`}
                width={109}
                height={98}
              />
              <Image
                className="w-coin w-coin2"
                src="/images/w-coin2.png"
                alt={`${t('home.coin')}`}
                width={69}
                height={70}
              />
              <Image
                className="w-coin w-coin3"
                src="/images/w-coin3.png"
                alt={`${t('home.coin')}`}
                width={51}
                height={51}
              />
              <div className="timeline-block">
                <div className="d-flex align-items-center timeline-item">
                  <div className="timeline-icon">
                    <Image
                      src="/images/people.svg"
                      alt={`${t('home.timeline1')} icon`}
                      width={72}
                      height={72}
                    />
                    <div className="timeline-bottom tb-1"></div>
                  </div>
                  <div className="ms-4 ">
                    <p className="heading-like mb-0">{t('home.timeline1')}</p>
                  </div>
                </div>
                <div className="d-flex timeline-item">
                  <div className="timeline-icon">
                    <Image
                      src="/images/linked.png"
                      alt={`${t('home.timeline2')} icon`}
                      width={72}
                      height={72}
                    />
                    <div className="timeline-bottom tb-2"></div>
                  </div>
                  <div className="ms-4 ">
                    <p className="heading-like mb-1">{t('home.timeline2')}</p>
                    <p>{t('home.timeline2_desc')}</p>
                  </div>

                </div>
                <div className="d-flex align-items-center timeline-item">
                  <div className="timeline-icon">
                    <Image
                      src="/images/chart.png"
                      alt={`${t('home.timeline3')} icon`}
                      width={72}
                      height={72}
                    />
                  </div>
                  <div className="ms-4 ">
                    <p className="heading-like mb-0">{t('home.timeline3')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="calculator">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2 calculator-block">
              <Image
                className="calc-img"
                src="/images/Layer 1.svg"
                alt={`${t('home.calculator_btn')}`}
                width={307}
                height={224}
                priority
              />
              <h2>{t.rich('home.calculator_title', {
                perkx: (chunks) => (
                  <span className="perkx">{chunks}</span>
                ),
              })}</h2>
              <p>{t('home.calculator_desc')}</p>
              <a href="/calculator" className='calc-btn'>{t('home.calculator_btn')}</a>
            </div>
          </div>
        </div>
      </section>
      {data.campaigns && data.campaigns.length > 0 && (
        <section className="campaign-section">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <h2>{t('home.exclusive_campaigns')}</h2>
              </div>
              <div className="col-md-4 campaign-view hidden-xs">
                <a href="/campaigns">{t('home.view_all_campaigns')}</a>
                <Image
                  src="/images/arrow-right-s-line.svg"
                  alt="arrow right line"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </div>
            </div>
            <CampaignSection campaigns={data.campaigns || []}/>
            <div className="row">
              <div className="col-md-12 campaign-view show-xs">
                <a href="/campaigns">{t('home.view_all_campaigns')}</a>
                <Image
                  src="/images/arrow-right-s-line.svg"
                  alt="arrow right line"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </section>
      )}
      {data.exchanges && data.exchanges.length > 0 && (
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
            <div className="text-center">
              <h2>{t('home.partner_exchanges')}</h2>
              <p>{t('home.partner_exchanges_desc')}</p>
            </div>
            <div className="position-relative">
              <Image
                src="/images/box1.png"
                className="pe-box pe-box1"
                alt={t('home.partner_exchanges') + ` box`}
                width={161}
                height={155}
                aria-hidden="true"
              />
              <Image
                src="/images/box2.png"
                className="pe-box pe-box2"
                alt={t('home.partner_exchanges') + ` box`}
                width={120}
                height={125}
                aria-hidden="true"
              />

              <div className="pe-table">
                <div className="hidden-xs">
                  <PartnerExchangesTable exchanges={data?.exchanges} />
                </div>
                <div className="show-xs">
                  <PartnerExchangesMobileTable exchanges={data?.exchanges} />
                </div>
                <div className=" d-flex justify-content-center mt-4">
                  <a
                    href="/exchanges"
                    className="perk-primary-btn d-inline-flex align-items-center gap-2 text-decoration-none"
                  >
                    {t("home.view_all_partners")}
                    <Image
                      src="/images/arrow-right-s-line.svg"
                      alt="arrow right line"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
