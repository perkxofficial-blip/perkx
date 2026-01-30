'use client'

import dynamic from 'next/dynamic'
const CampaignSectionSlide = dynamic(() => import('././CampaignSectionSlide'), {
  ssr: false,
})
export interface CampaignsProps {
  campaigns: any
}
export default function CampaignSection({campaigns}: CampaignsProps) {
  return (
    <div>
      <CampaignSectionSlide
        campaigns={campaigns}
      />
    </div>
  )
}
