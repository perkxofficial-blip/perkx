import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
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
                <h1 className="gradient-title page-header-lv1">{t('hero.title')}</h1>
                <p>{t('hero.subtitle')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Terms of Use Content */}
      <section className="terms-content">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <br />
              <p className="effective-date"><strong>{t('effective_date')}</strong> 01/02/2026</p>
              
              <p>{t('intro.paragraph1')}</p>
              <p>{t('intro.paragraph2')}</p>

              <h2>{t('sections.definitions.title')}</h2>
              <p>{t('sections.definitions.intro')}</p>
              <ol>
                {t.raw('sections.definitions.items').map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.eligibility.title')}</h2>
              <ol>
                {t.raw('sections.eligibility.items').map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.registration.title')}</h2>
              <ol>
                {t.raw('sections.registration.items').map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.nature_of_service.title')}</h2>
              <ol>
                {t.raw('sections.nature_of_service.items').map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.no_custody.title')}</h2>
              <ol>
                {t.raw('sections.no_custody.items').map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.partner_offers.title')}</h2>
              <ol>
                {t.raw('sections.partner_offers.items').slice(0, 3).map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t.raw('sections.partner_offers.items')[2] }} />
                  <ul>
                    {t.raw('sections.partner_offers.sub_items').map((subItem: string, index: number) => (
                      <li key={index}>{subItem}</li>
                    ))}
                  </ul>
                </li>
                {t.raw('sections.partner_offers.items').slice(3).map((item: string, index: number) => (
                  <li key={index + 3} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.partner_exchanges.title')}</h2>
              <ol>
                <li>{t.raw('sections.partner_exchanges.items')[0]}</li>
                <li>
                  {t.raw('sections.partner_exchanges.items')[1]}
                  <ul>
                    {t.raw('sections.partner_exchanges.sub_items').map((subItem: string, index: number) => (
                      <li key={index}>{subItem}</li>
                    ))}
                  </ul>
                </li>
                <li>{t.raw('sections.partner_exchanges.items')[2]}</li>
              </ol>

              <h2>{t('sections.uid_linking.title')}</h2>
              <ol>
                {t.raw('sections.uid_linking.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>

              <h2>{t('sections.prohibited_conduct.title')}</h2>
              <p>{t('sections.prohibited_conduct.intro')}</p>
              <ol>
                {t.raw('sections.prohibited_conduct.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
              <p>{t('sections.prohibited_conduct.conclusion')}</p>

              <h2>{t('sections.service_availability.title')}</h2>
              <ol>
                {t.raw('sections.service_availability.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>

              <h2>{t('sections.no_investment_advice.title')}</h2>
              <ol>
                {t.raw('sections.no_investment_advice.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>

              <h2>{t('sections.intellectual_property.title')}</h2>
              <ol>
                {t.raw('sections.intellectual_property.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>

              <h2>{t('sections.suspension_termination.title')}</h2>
              <ol>
                {t.raw('sections.suspension_termination.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>

              <h2>{t('sections.disclaimers.title')}</h2>
              <ol>
                {t.raw('sections.disclaimers.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>

              <h2>{t('sections.limitation_liability.title')}</h2>
              <ol>
                {t.raw('sections.limitation_liability.items').map((item: string, index: number) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>

              <h2>{t('sections.indemnification.title')}</h2>
              <p>{t('sections.indemnification.content')}</p>

              <h2>{t('sections.privacy.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t.raw('sections.privacy.paragraph1') }} />
              <p>{t('sections.privacy.paragraph2')}</p>

              <h2>{t('sections.amendments.title')}</h2>
              <p>{t('sections.amendments.paragraph1')}</p>
              <p>{t('sections.amendments.paragraph2')}</p>
              <p>{t('sections.amendments.paragraph3')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
