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
        src={`/images/campaign2.png`}
        alt="Campaign"
        width={280}
        height={362}
        className="campaign-img"
      />
      <div className="campaign-box">
        <div className="tags">
          <div className="tag all-user">
            ALL USERS
          </div>
        </div>
        <p>Trader World Cup</p>
        <span>Win a share of $1,000,000 prize pool and 50% extra rebate for top traders</span>
        <a href="">{joinNow}</a>
      </div>
    </div>
  );
};

export default CampaignItem;
