import type { Metadata } from "next";

type SeoParams = {
  locale: "en" | "ko";
  path: string; // /how-it-works
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

export function generateSeoMetadata({
                                      locale,
                                      path,
                                      title,
                                      description,
                                      ogTitle,
                                      ogDescription
                                    }: SeoParams): Metadata {
  const baseUrl = "https://perkx.com";

  return {
    title,
    description,

    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        en: `${baseUrl}/en${path}`,
        ko: `${baseUrl}/ko${path}`
      }
    },

    openGraph: {
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      url: `${baseUrl}/${locale}${path}`,
      siteName: "PerkX",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      type: "website"
    }
  };
}
