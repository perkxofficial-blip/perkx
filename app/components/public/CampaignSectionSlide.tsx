'use client'
import Image from "next/image";

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
    <div className="campaign-slider-wrapper position-relative">
      <div className="campaign-prev">
        <div className="glass-shape glass-left">
          <Image
            src="/images/arrow-sm-right.svg"
            alt="Prev"
            width={24}
            height={24}
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="campaign-next">
        <div className="glass-shape glass-right">
          <Image
            src="/images/arrow-sm-left.svg"
            alt="Prev"
            width={24}
            height={24}
            aria-hidden="true"
          />
        </div>
      </div>
      <Swiper
        modules={[Autoplay, Navigation]}
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
        navigation={{
          prevEl: '.campaign-prev',
          nextEl: '.campaign-next',
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
    </div>
  )
}
