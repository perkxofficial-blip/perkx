'use client'
export interface CampaignsProps {
  campaigns: any[]
}
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import CampaignItem from "@/components/public/CampaignItem";
export default function PartnerSectionSlide({campaigns}: CampaignsProps) {
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
      {campaigns.map((campaign, index) => (
        <SwiperSlide key={campaign.id || index} className="campaign-slide-item">
          <CampaignItem campaign={campaign}/>
        </SwiperSlide>
      ))}
    </Swiper>

  )
}
