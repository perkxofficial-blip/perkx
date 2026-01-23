'use client'

import dynamic from 'next/dynamic'

const SwiperClient = dynamic(() => import('./SwiperClient'), {
  ssr: false,
})

export default function PartnerSection() {
  return (
    <div className="partner-section">
      <div className="container-fluid">
        <SwiperClient />
      </div>
    </div>
  )
}
