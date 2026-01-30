import Header from "@/components/public/Header";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {Campaign, getAllCampaigns} from '@/services/api/public/campaign';
import {Exchange, getAllExchanges} from "@/services/api/public/exchange";
import CampaignItem from "@/components/public/CampaignItem";
import SelectSearch from "@/components/public/SelectSearch";
import Pagination from "@/components/public/Pagination";

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
  }
}
export default async function CampaignPage({ searchParams }: Props) {
  const params = await searchParams
  const data = await campaigns(params);
  const t = await getTranslations();
  const categories = [
    {value:'', label: t('campaign.all_category')},
    {value:'new_user', label: t('campaign.category_new_user')},
    {value:'trading_competition ', label: t('campaign.category_trading')},
  ]
  const statuses = [
    {value:'', label: t('campaign.all_campaign_status')},
    {value:'active', label: t('campaign.status_active')},
    {value:'upcoming', label: t('campaign.status_upcoming')},
    {value:'ended', label: t('campaign.status_ended')},
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
    {value:'10', label: '10'},
    {value:'20', label: '20'},
    {value:'50', label: '50'},
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
      <section className="campaign-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-3">
              <div className="mb-3 position-relative">
                <label htmlFor="holderInput" className="form-label">
                  {t('campaign.campaign_holder')}
                </label>
                <SelectSearch name='holder' options={exchangeOptions} />

                <Image
                  src="/images/arrow-down.svg"
                  alt={t('campaign.all_campaign_holder')}
                  width={20}
                  height={20}
                  className="img-icon"
                />
              </div>
            </div>
            <div className="col-md-3">
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
            <div className="col-md-3">
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
            {data?.campaigns?.data && data?.campaigns?.data.map((campaign: any) => (
              <div className='col-md-3' key={campaign.id}>
                <CampaignItem campaign={campaign} btnName={t('campaign.btn_name')}  isDetail={true}/>
              </div>
            ))}
          </div>
          {pagination && (
            <div className="row pagination">
              <div className="col-md-6">
                <div className="d-flex align-items-center  gap-3">
                  <p className="mb-0">
                    {t.rich('paging.showing_to_of', {
                      from: pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1,
                      to: Math.min(pagination.page * pagination.limit, pagination.total),
                      total: pagination.total,
                      bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>

                  <p className="mb-0">{t('paging.result_per_page')}</p>
                  <SelectSearch name="limit" options={perPages} />
                </div>
              </div>
              <div className="col-md-6">
               <Pagination pagination={pagination} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
