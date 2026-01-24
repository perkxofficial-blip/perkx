'use client'

import dynamic from 'next/dynamic'
const CampaignSectionSlide = dynamic(() => import('././CampaignSectionSlide'), {
  ssr: false,
})

export default function CampaignSection() {
  return (
    <div>
      <CampaignSectionSlide />
    </div>
  )
}
