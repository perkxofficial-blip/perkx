import Footer from '@/components/public/Footer';
import { generatePageMetadata } from '@/lib/seo';
import {getPageBySlug} from "@/services/api";
import type {Metadata} from "next";
import Script from 'next/script';
interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug('home', locale);

  if (!page) {
    return {
      title: 'Home | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer/>
      {/* Start of home-90795 Zendesk Widget script */}
      <Script
        id="ze-snippet"
        src="https://static.zdassets.com/ekr/snippet.js?key=867454fa-55b5-4302-8707-bb2eb1a94690"
        strategy="lazyOnload"
      />
      {/* End of home-90795 Zendesk Widget script */}
    </>
  );
}
