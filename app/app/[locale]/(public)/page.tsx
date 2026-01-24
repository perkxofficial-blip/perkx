import { cookies } from 'next/headers';
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PartnerSection from "@/components/public/PartnerSection";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {renderText} from "@/lib/renderText";
import CampaignSection from "@/components/public/CampaignSection";

async function getLandingData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const res = await fetch('http://localhost:3000/api/landing/features', {
      cache: 'no-store',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });

    if (!res.ok) return { features: [] };
    return res.json();
  } catch {
    return { features: [] };
  }
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
                    href="/get-started"
                    className="btn btn-get-started d-inline-flex align-items-center"
                  >
                    <span>{t("home.get_started_now")}</span>
                    <Image
                      src="/images/icon/arrow-right-s-line.svg"
                      alt={t("home.get_started_now")}
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
          <PartnerSection />
        </section>
      </div>
      <section className="how-perk-work work-bg">
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

              <div className="timeline-block">
                <div className="d-flex align-items-center timeline-item">
                  <div className="timeline-icon">
                    <Image
                      src="/images/linked.png"
                      alt={`${t('home.timeline1')} icon`}
                      width={72}
                      height={72}
                    />
                    <div className="timeline-bottom tb-2"></div>
                  </div>
                  <div className="ms-4 ">
                    <h5 className="mb-0">{t('home.timeline1')}</h5>
                  </div>
                </div>
                <div className="d-flex align-items-center timeline-item">
                  <div className="timeline-icon">
                    <Image
                      src="/images/linked.png"
                      alt={`${t('home.timeline2')} icon`}
                      width={72}
                      height={72}
                    />
                    <div className="timeline-bottom"></div>
                  </div>
                  <div className="ms-4 ">
                    <h5 className="mb-1">{t('home.timeline2')}</h5>
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
                    <h5 className="mb-0">{t('home.timeline3')}</h5>
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
                width={207}
                height={224}
                priority
              />
              <h2>{t.rich('home.calculator_title', {
                perkx: (chunks) => (
                  <span className="perkx">{chunks}</span>
                ),
              })}</h2>
              <p>{t('home.calculator_desc')}</p>
              <a href="" className='calc-btn'>{t('home.calculator_btn')}</a>
            </div>
          </div>
        </div>
      </section>
      <section className="campaign-section">
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <h2>{t('home.exclusive_campaigns')}</h2>
            </div>
            <div className="col-md-4 campaign-view">
              <a href="">{t('home.view_all_campaigns')}</a>
              <Image
                src="/images/arrow-right-s-line.svg"
                alt="arrow right line"
                width={20}
                height={20}
                aria-hidden="true"
              />
            </div>
          </div>
          <CampaignSection campaigns={[]} joinNow={t('home.join_now')}/>
        </div>
      </section>
{/*<Footer/>*/}
    </>
  );
}
