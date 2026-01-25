'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import Image from "next/image"
export default function PartnerSectionSlide() {
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
      {[1, 2, 3, 4, 5, 6, 1, 3, 2,4,5].map((i, index) => (
        <SwiperSlide key={index}>
          <div className="item">
            <Image
              src={`/images/partner/${i}.png`}
              alt={`Partner ${i} logo`}
              width={120}
              height={50}
              className="partner-logo"
              loading="lazy" // lazy load
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
