import Header from "@/components/public/Header";
import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';
import '@/styles/public/about-us.scss';

interface AboutUsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AboutUsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('about');
  
  return {
    title: t("meta.title") || 'About Us | PerkX',
    description: t("meta.description") || 'Learn more about PerkX and our mission',
  };
}

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('about');

  return (
    <>
      <div className="page-img-bg about-page">
        <Header />
        {/* Hero Section */}
        <section className="banner-section" aria-label="Hero Section - About Us">
          <div className="container-fluid">
            <div className="row position-relative">
              <div className="get-started col-md-12 text-center">
                <h1>{t('hero.title')}</h1>
                <p>{t('hero.subtitle')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Main Content Section */}
      <section className="campaign-section position-relative">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="about-content-wrapper">
                {/* Intro Section */}
                <div className="about-intro">
                  <h2 className="about-intro-title">{t('intro.title')}</h2>
                  <p className="about-intro-description">{t('intro.description')}</p>
                </div>

                {/* What We Do Section */}
                <div className="about-section">
                  <h3 className="about-section-title">{t('sections.what_we_do.title')}</h3>
                  <ul className="about-section-list">
                    {t.raw('sections.what_we_do.items').map((item: string, index: number) => (
                      <li key={index} className="about-section-item">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* What We Don't Do Section */}
                <div className="about-section">
                  <h3 className="about-section-title">{t('sections.what_we_dont_do.title')}</h3>
                  <ul className="about-section-list">
                    {t.raw('sections.what_we_dont_do.items').map((item: string, index: number) => (
                      <li key={index} className="about-section-item">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Footer Note Section */}
                <div className="about-footer-note">
                  <h3 className="about-footer-note-title">{t('footer_note.title')}</h3>
                  <p className="about-footer-note-description">
                    {t('footer_note.description')}
                    <br />
                    {t('footer_note.tldr')}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
      </section>
    </>
  );
}
