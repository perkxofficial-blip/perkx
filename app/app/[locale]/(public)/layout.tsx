import { generateSeoMetadata } from "@/lib/seo";
import {getTranslations} from "next-intl/server";

// @ts-ignore
export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale });

  return generateSeoMetadata({
    locale,
    path: "/",
    title: t("meta.how_it_works.title"),
    description: t("meta.how_it_works.description"),
    ogTitle: t("meta.how_it_works.og_title"),
    ogDescription: t("meta.how_it_works.og_description")
  });
}
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}
