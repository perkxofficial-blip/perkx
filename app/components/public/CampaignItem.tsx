import Image from 'next/image';
export interface CampaignItemProps {
  campaign: any
  joinNow: string
  className?: string
}

const CampaignItem = ({campaign, joinNow, className}: CampaignItemProps) => {
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
        <a href={campaign.redirect_url}>{joinNow}</a>
      </div>
    </div>
  );
};

export default CampaignItem;
