'use client'

import dynamic from 'next/dynamic'
import {useTranslations} from "next-intl";

interface PartnerSectionProps {
    exchanges: any[]
}

const PartnerSectionSlide = dynamic(() => import('./PartnerSectionSlide'), {
    ssr: false,
})

export default function PartnerSection({ exchanges }: PartnerSectionProps) {
  const t = useTranslations();
    return (
      <div className="partner-section-bottom">
        <div className="text-center partner-section-title">{t('home.our_exclusive_partners')}</div>
        <div className="partner-section">
          <div className="container-fluid">
            <PartnerSectionSlide exchanges={exchanges} />
          </div>
        </div>
      </div>
    )
}
