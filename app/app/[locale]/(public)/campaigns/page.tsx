import Header from "@/components/public/Header";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {Campaign, getAllCampaigns} from '@/services/api/public/campaign';
import {Exchange, getAllExchanges} from "@/services/api/public/exchange";
import CampaignItem from "@/components/public/CampaignItem";
import SelectSearch from "@/components/public/SelectSearch";
import Pagination from "@/components/public/Pagination";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

async function campaigns(params: any) {
  const result: {
    campaigns: {
      data: Campaign[],
      pagination: any
    },
    exchanges: Exchange[],
  } = {
    campaigns: {
      data: [],
      pagination: {}
    },
    exchanges: [],
  };

  try {
    const campaigns: any = await getAllCampaigns(params);
    if (campaigns) { 
      result.campaigns = campaigns;
    }
  } catch {
    // Handle errors silently
  }
  try {
    const exchanges = await getAllExchanges();
    if (exchanges) {
      result.exchanges = exchanges;
    }
  } catch {
    // Handle errors silently
  }
  return result;
}
interface Props {
  searchParams: {
    holder?: string
    category?: string
    status?: string
    page?: string
    per_page?: string
    locale: string
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { locale } = await searchParams;
  const t = await getTranslations('campaign');

  return {
    title: t("meta.title") || 'Campaigns | PerkX',
    description: t("meta.description") || 'View all available campaigns and exchange offers',
  };
}

export default async function CampaignPage({ searchParams }: Props) {
  const params = await searchParams
  const data = await campaigns(params);
  const t = await getTranslations();
  const categories = [
    {value:'', label: t('campaign.all_category')},
    {value:'all_user', label: t('campaign.category_all_user')},
    {value:'new_user', label: t('campaign.category_new_user')},
  ]
  const statuses = [
    {value:'', label: t('campaign.all_campaign_status')},
    {value:'active', label: t('campaign.status_active')},
    {value:'upcoming', label: t('campaign.status_upcoming')},
    {value:'expired', label: t('campaign.status_expired')},
  ]
  const exchangeOptions: any = [
    { value: '', label: t('campaign.all_campaign_holder') },
    { value: 'perkx', label: 'PerkX' },
    ...data.exchanges.map((item: any) => ({
      value: item.code,
      label: item.name,
    })),
  ];
  const perPages = [
    {value:'20', label: '20'},
    {value:'40', label: '40'},
    {value:'80', label: '80'},
  ]
  const pagination: any = data?.campaigns?.pagination ?? {}
  return (
    <>
      <div className="page-img-bg campaign-page">
        <Header/>
        <section className="banner-section " aria-label="Hero Section - Trade Global Market">
          <div className="container-fluid">
            <div className="row position-relative">

              <div className="bitcoin-left col-md-3" aria-hidden="true"></div>
              <div className="get-started col-md-6 text-center">
                <h1>{t.rich('campaign.title', {
                  perkx: (chunks) => (
                    <span className="perkx">{chunks}</span>
                  ),
                })}</h1>
                <p>
                  {t("campaign.desc")}
                </p>

              </div>

              <div className="bitcoin-left col-md-3" aria-hidden="true"></div>
            </div>
          </div>
        </section>
      </div>
      <section className="campaign-section position-relative">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-md-3 col-4">
              <div className="mb-3 position-relative">
                <label htmlFor="holderInput" className="form-label">
                  {t('campaign.campaign_holder')}
                </label>
                <SelectSearch name='exchange' options={exchangeOptions} />

                <Image
                  src="/images/arrow-down.svg"
                  alt={t('campaign.all_campaign_holder')}
                  width={20}
                  height={20}
                  className="img-icon"
                />
              </div>
            </div>
            <div className="col-md-3 col-4">
              <div className="mb-3 position-relative">
                <label htmlFor="categoryInput" className="form-label">
                  {t('campaign.category')}
                </label>
                <SelectSearch name='category' options={categories} />

                <Image
                  src="/images/arrow-down.svg"
                  alt={t('campaign.all_campaign_holder')}
                  width={20}
                  height={20}
                  className="img-icon"
                />
              </div>
            </div>
            <div className="col-md-3 col-4">
              <div className="mb-3 position-relative">
                <label htmlFor="statusInput" className="form-label">
                  {t('campaign.campaign_holder')}
                </label>
               <SelectSearch name='status' options={statuses} />
                <Image
                  src="/images/arrow-down.svg"
                  alt={t('campaign.all_campaign_holder')}
                  width={20}
                  height={20}
                  className="img-icon"
                />
              </div>
            </div>
          </div>
          <div className="row">
            {data?.campaigns?.data &&  data?.campaigns?.data.length > 0 ? data?.campaigns?.data.map((campaign: any) => (
              <div className='col-6 col-lg-3 mb-4' key={campaign.id}>
                <CampaignItem campaign={campaign}/>
              </div>
            )) : (
              <div className='col-md-12 mb-4 text-not-found'>
                {t('campaign.no_campaign_not_found')}
              </div>
            )}
          </div>
          {pagination && pagination?.total > 0 && (
            <div className="row align-items-center pagination">
              <div className="col-md-6 col-sm-12">
                <div className="d-flex align-items-center gap-3 hidden-xs">
                  <p className="mb-0">
                    {t.rich('paging.showing_to_of', {
                      from:
                        pagination.total === 0
                          ? 0
                          : (pagination.page - 1) * pagination.limit + 1,
                      to: Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      ),
                      total: pagination.total,
                      bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>

                  <p className="mb-0">{t('paging.result_per_page')}</p>
                  <SelectSearch name="limit" options={perPages} />
                </div>
              </div>
              <div className="col-md-6 col-12 d-flex pagination-page hidden-xs">
                <Pagination pagination={pagination} />
              </div>
              <div className="col-12 show-xs">
                <div className="gap-3">
                  <div className="row d-flex align-items-center ">
                    <div className="col-6">
                      <p className="mb-0">
                        {t.rich('paging.showing_to_of_mobile', {
                          from:
                            pagination.total === 0
                              ? 0
                              : (pagination.page - 1) * pagination.limit + 1,
                          to: Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          ),
                          total: pagination.total,
                          bold: (chunks) => <strong>{chunks}</strong>,
                        })}
                      </p>
                    </div>
                    <div className="col-6 d-flex  justify-content-end"><SelectSearch name="limit" options={perPages} /></div>
                  </div>
                </div>
              </div>
              <div className="col-12 d-flex pagination-page show-xs">
                <Pagination pagination={pagination} />
              </div>
            </div>

          )}
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
