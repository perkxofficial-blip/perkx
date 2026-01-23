import { cookies } from 'next/headers';
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PartnerSection from "@/components/public/PartnerSection";
import Image from "next/image";
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
      <Header/>
      <section className="banner-section" aria-label="Hero Section - Trade Global Market">
        <div className="container-fluid">
          <div className="row position-relative">
            {/* Decorative coins */}
            <Image
              src="/images/coin1.png"
              className="coin coin-1"
              alt="Decorative coin"
              width={100}
              height={50}
              aria-hidden="true"
              priority={false}
            />
            <Image
              src="/images/coin1.png"
              className="coin coin-2"
              alt="Decorative coin"
              width={162}
              height={50}
              aria-hidden="true"
            />
            <Image
              src="/images/coin2.png"
              className="coin coin-3"
              alt="Decorative coin"
              width={170}
              height={50}
              aria-hidden="true"
            />
            <Image
              src="/images/coin1.png"
              className="coin coin-4"
              alt="Decorative coin"
              width={105}
              height={50}
              aria-hidden="true"
            />

            <div className="bitcoin-left col-md-3" aria-hidden="true"></div>

            <div className="get-started col-md-6 text-center">
              <h2>Trade Global Market</h2>
              <h1>Maximize Your Rebates</h1>
              <p>
                Join thousands of high-performance traders using PerkX to claim
                industry-leading cashback on every trade. Professional tools for
                serious volume.
              </p>

              <div className="mt-3">
                <a
                  href="/get-started"
                  className="btn btn-get-started d-inline-flex align-items-center"
                >
                  <span>Get Started Now</span>
                  <Image
                    src="/images/icon/arrow-right-s-line.svg"
                    alt="Arrow pointing right"
                    width={16}
                    height={16}
                    className="ms-2"
                  />
                </a>
              </div>
            </div>

            <div className="bitcoin-left col-md-3" aria-hidden="true"></div>
          </div>
        </div>

        {/* Partner Section (Owl Carousel) */}
        <PartnerSection />
      </section>

    </>
  );
}
