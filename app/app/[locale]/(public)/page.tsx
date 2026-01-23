import { cookies } from 'next/headers';
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PartnerSection from "@/components/public/PartnerSection";

// Server-side data fetching (SSR)
async function getLandingData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    const res = await fetch('http://localhost:3000/api/landing/features', {
      cache: 'no-store',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!res.ok) return { features: [] };
    return res.json();
  } catch {
    return { features: [] };
  }
}

export default async function LandingPage() {
  const data = await getLandingData();
  
  return (
    <>
      <Header />
      {/* ===== Banner Section ===== */}
      <div className="banner-section">
        <div className="container-fluid">
          <div className="row position-relative">
            <img src="/images/coin1.png" className="coin coin-1" alt="" />
            <img src="/images/coin1.png" className="coin coin-2" alt="" />
            <img src="/images/coin2.png" className="coin coin-3" alt="" />
            <img src="/images/coin1.png" className="coin coin-4" alt="" />

            <div className="bitcoin-left col-md-3"></div>

            <div className="get-started col-md-6">
              <h2>Trade Global Market.</h2>
              <h1>Maximize Your Rebates</h1>
              <h4>
                Join thousands of high-performance traders using PerkX to claim
                industry-leading cashback on every trade. Professional tools for
                serious volume.
              </h4>

              <div>
                <a href="#" className="btn btn-get-started">
                  Get Started Now
                  <img
                    src="/images/icon/arrow-right-s-line.svg"
                    alt="arrow"
                  />
                </a>
              </div>
            </div>

            <div className="bitcoin-left col-md-3"></div>
          </div>
        </div>

        {/* ===== Partner Section (Owl Carousel) ===== */}
        <PartnerSection />
      </div>

    </>
  );
}
