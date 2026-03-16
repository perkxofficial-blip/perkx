import Header from "@/components/public/Header";
import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';
import Image from "next/image";
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
      <div className="page-img-bg about-us-page">
        <Header />
        {/* Hero Section */}
        <section className="banner-section" aria-label="Hero Section - About Us">
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

      {/* Main Content Section */}
      <section className="content-section position-relative">
        <div className="container">
          {/* Intro Section with Image */}
          <div className="intro-wrapper">
            <div className="intro-text">
              {t.raw('intro.titles').map((title: string, index: number) => (
                <h2 key={index}>{title}</h2>
              ))}
              <br/>
              <div className="intro-description">
                {t.raw('intro.descriptions').map((desc: string, index: number) => (
                  <p key={index}>{desc}</p>
                ))}
              </div>
            </div>
            <div className="intro-image">
              <Image
                src="/images/about-image.png"
                alt="Crypto Perks Illustration"
                width={514}
                height={340}
                className="w-100 h-auto"
              />
            </div>
          </div>

          {/* Cards Section */}
          <div className="cards-wrapper">
            {/* What We Do Card */}
            <div className="info-card">
              <h3>{t('sections.what_we_do.title')}</h3>
              <ul className="bullet-list cyan-bullets">
                {t.raw('sections.what_we_do.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* What We Don't Do Card */}
            <div className="info-card">
              <h3>{t('sections.what_we_dont_do.title')}</h3>
              <ul className="bullet-list pink-bullets">
                {t.raw('sections.what_we_dont_do.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Note Section */}
          <div className="footer-note-section">
            <h3>{t('footer_note.title')}</h3>
            <div className="footer-note-description">
              <p>{t('footer_note.description')}</p>
              <p>&nbsp;</p>
              <p>{t('footer_note.tldr')}</p>
              <p>{t('footer_note.tldr_note')}</p>
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
