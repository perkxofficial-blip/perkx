'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import Image from "next/image"

interface PartnerSectionSlideProps {
  exchanges: any[]
}

export default function PartnerSectionSlide({ exchanges }: PartnerSectionSlideProps) {
  return (
    <Swiper
      modules={[Autoplay]}
      loop
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      spaceBetween={10}
      breakpoints={{
        0: { slidesPerView: 2 },
        600: { slidesPerView: 6 },
        1000: { slidesPerView: 8 },
      }}
      className="partner-slide"
    >
      {exchanges.map((exchange, index) => (
        <SwiperSlide key={index}>
          <div className="item">
            <Image
              src={exchange.logo_url}
              alt={exchange.name}
              width={120}
              height={50}
              className="partner-logo"
              loading="lazy" // lazy load
              unoptimized
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
