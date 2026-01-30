'use client'

import Image from "next/image"

interface PartnerSectionSlideProps {
  exchanges: any[]
}

export default function PartnerSectionSlide({ exchanges }: PartnerSectionSlideProps) {
  const duplicatedExchanges = [...exchanges, ...exchanges]
  
  return (
    <div className="partner-slide-wrapper">
      <div className="partner-slide">
        {duplicatedExchanges.map((exchange, index) => (
          <div key={index} className="item">
            <Image
              src={exchange.logo_url}
              alt={exchange.name}
              width={120}
              height={50}
              className="partner-logo"
              loading="lazy"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  )
}
