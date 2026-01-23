'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'

export default function SwiperClient() {
  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      loop
      navigation
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
            <img src={`/images/partner/${i}.png`} alt="" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
