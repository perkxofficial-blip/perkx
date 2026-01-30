import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/public/Header';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
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

  const campaign = await getCampaignData(slug);

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
              <p>{campaign.description}</p>
            </div>

            <div className="campaign-detail-actions">
              <Link href={campaign.redirect_url} target="_blank" rel="noopener noreferrer" className="btn btn-campaign-join">
                {t('join_campaign')}
              </Link>
            </div>
          </div>
        </div>
    </>
  );
}
