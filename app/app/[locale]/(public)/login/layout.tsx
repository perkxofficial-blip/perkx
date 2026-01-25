import { generatePageMetadata, generateStructuredData } from '@/lib/seo';
import {getTranslations} from "next-intl/server";
import {getPageBySlug} from "@/services/api";

// @ts-ignore
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug('Home', locale);

  if (!page) {
    return {
      title: 'Home | PerkX',
      description: 'Learn more about PerkX and our mission',
    };
  }

  return generatePageMetadata({ page, locale });
}
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}
