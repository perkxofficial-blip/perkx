import Image from 'next/image';
import {useTranslations} from "next-intl";
export interface CampaignItemProps {
  campaign: any
}

const CampaignItem = ({campaign}: CampaignItemProps) => {
  const t = useTranslations();
  return (
    <div
      className={`campaign-item`}
    >
      <Image
        src={campaign.banner_url}
        alt={campaign.title}
        width={280}
        height={362}
        className="campaign-img"
        unoptimized
      />
      <div className="campaign-box-padding">
        <div className="campaign-box">
          <div className="tags d-flex align-items-center gap-2">
            <div className={`tag ${campaign.category}`}>
              {t(`campaign.category_${campaign.category}`)}
            </div>
            <div className={`tag ${campaign.status}`}>
              {t(`campaign.status_${campaign.status}`)}
            </div>
          </div>
          <p className="campaign-title">{campaign.title}</p>
          <span className='campaign-desc'>{campaign.description}</span>
          <a href={`/campaigns/${campaign.slug}`}>{t('campaign.btn_name')}</a>
        </div>
      </div>
    </div>
  );
};

export default CampaignItem;
