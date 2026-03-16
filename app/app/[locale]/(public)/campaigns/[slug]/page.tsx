import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/public/Header';
import Link from 'next/link';
import Image from 'next/image';
import { getCampaign } from '@/services/api/public/campaign';

interface CampaignDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

interface Campaign {
  id: number;
  slug: string;
  redirect_url: string;
  title: string;
  description: string;
  banner_url: string;
}

async function getCampaignData(slug: string): Promise<Campaign | null> {
  try {
    const response = await getCampaign(slug);
    if (response && !Array.isArray(response)) {
      return response;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations('campaign');

  const campaign: any = await getCampaignData(slug);
  if (!campaign) {
    notFound();
  }

  return (
    <>
      <Header />
        <div className="campaign-detail-page">
          <div className="container">
            <nav aria-label="breadcrumb" className="campaign-breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/">{t('breadcrumb_home')}</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/campaigns">{t('breadcrumb_campaigns')}</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {campaign.title}
                </li>
              </ol>
            </nav>

            <h1 className="campaign-detail-title">{campaign.title}</h1>

            <div className="campaign-detail-hero">
              <Image
                src={campaign.banner_url}
                alt={campaign.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="campaign-detail-content">
              <div dangerouslySetInnerHTML={{ __html: campaign.description }} />
            </div>
            {campaign.redirect_url.length && (
              <div className="campaign-detail-actions">
                <a
                  href={campaign.status === 'expired' ? undefined : campaign.redirect_url}
                  className={`btn btn-campaign-join ${campaign.status === 'expired' ? 'btn-disabled' : ''}`}
                  aria-disabled={campaign.status === 'expired'}
                >
                  {t('join_campaign')}
                </a>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
