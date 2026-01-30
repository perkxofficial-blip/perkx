import Image from 'next/image';
export interface CampaignItemProps {
  campaign: any
  btnName: string
  className?: string
  isDetail: boolean
}

const CampaignItem = ({campaign, btnName, className, isDetail = false}: CampaignItemProps) => {
  const link = isDetail ? `/campaigns/${campaign.slug}` : campaign.redirect_url
  return (
    <div
      className={`campaign-item ${className ?? ''}`}
    >
      <Image
        src={campaign.banner_url}
        alt={campaign.title}
        width={280}
        height={362}
        className="campaign-img"
        unoptimized
      />
      <div className="campaign-box">
        <div className="tags">
          <div className="tag all-user">
            ALL USERS
          </div>
        </div>
        <p>{campaign.title}</p>
        <span>{campaign.description}</span>
        <a href={link}>{btnName}</a>
      </div>
    </div>
  );
};

export default CampaignItem;
