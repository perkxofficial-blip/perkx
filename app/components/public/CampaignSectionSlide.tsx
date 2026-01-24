'use client'
export interface CampaignsProps {
  campaigns: any
  joinNow: string
}
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import Image from "next/image"
import CampaignItem, {CampaignItemProps} from "@/components/public/CampaignItem";
export default function PartnerSectionSlide({campaigns, joinNow}: CampaignsProps) {
  return (
    <Swiper
      modules={[Autoplay]}
      loop
      centeredSlides
      slidesPerView="auto"
      spaceBetween={20}
      autoplay={{
        delay: 1000,
        disableOnInteraction: true,
      }}
      className="campaign-slide"
    >
      {[1, 2, 1, 2, 1, 2, 1, 2].map((i, index) => (
        <SwiperSlide key={index} className="campaign-slide-item">
          <CampaignItem campaign={[]} joinNow={joinNow}/>
        </SwiperSlide>
      ))}
    </Swiper>

  )
}
