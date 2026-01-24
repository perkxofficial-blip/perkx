'use client'

import dynamic from 'next/dynamic'

const PartnerSectionSlide = dynamic(() => import('././PartnerSectionSlide'), {
  ssr: false,
})

export default function PartnerSection() {
  return (
    <div className="partner-section">
      <div className="container-fluid">
        <PartnerSectionSlide />
      </div>
    </div>
  )
}
