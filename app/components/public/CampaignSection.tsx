'use client'

import dynamic from 'next/dynamic'
const CampaignSectionSlide = dynamic(() => import('././CampaignSectionSlide'), {
  ssr: false,
})
export interface CampaignsProps {
  campaigns: any
  joinNow: string
}
export default function CampaignSection({campaigns, joinNow}: CampaignsProps) {
  return (
    <div>
      <CampaignSectionSlide campaigns={campaigns} joinNow={joinNow}/>
    </div>
  )
}
