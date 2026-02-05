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
      <main>
        {children}
      </main>
      <Footer/>
      {/* Start of home-90795 Zendesk Widget script */}
      <Script
        id="ze-snippet"
        src={`https://static.zdassets.com/ekr/snippet.js?key=${process.env.NEXT_PUBLIC_ZENDESK_KEY}`}
        strategy="lazyOnload"
      />
      {/* End of home-90795 Zendesk Widget script */}
    </>
  );
}
