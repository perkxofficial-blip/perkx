'use client'
export interface CampaignsProps {
  campaigns: any[]
}
import { Swiper, SwiperSlide } from 'swiper/react'
import {Autoplay, Navigation} from 'swiper/modules'
import CampaignItem from "@/components/public/CampaignItem";
export default function PartnerSectionSlide({campaigns}: CampaignsProps) {
  const loopCampaigns =
    campaigns.length >= 5 ? [...campaigns, ...campaigns] : campaigns;
  return (
    <Swiper
      modules={[Autoplay]}
      loop
      centeredSlides
      slidesPerView="auto"
      spaceBetween={20}
      speed={800}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      className="campaign-slider"
    >
      {loopCampaigns.map((campaign, index) => (
        <SwiperSlide key={index} className="campaign-slide-item">
          <div className="campaign-card">
            <CampaignItem campaign={campaign} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
