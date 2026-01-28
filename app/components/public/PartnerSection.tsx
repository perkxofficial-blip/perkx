'use client'

import dynamic from 'next/dynamic'

interface PartnerSectionProps {
    exchanges: any[]
}

const PartnerSectionSlide = dynamic(() => import('./PartnerSectionSlide'), {
    ssr: false,
})

export default function PartnerSection({ exchanges }: PartnerSectionProps) {
    return (
        <div className="partner-section">
            <div className="container-fluid">
                <PartnerSectionSlide exchanges={exchanges} />
            </div>
        </div>
    )
}
