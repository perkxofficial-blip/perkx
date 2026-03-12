import type { MetadataRoute } from 'next'
import {LOCALES} from './const';

export const SITEMAP_ROUTES = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: '/how-it-works', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/exchanges', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/calculator', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/campaigns', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/about-us', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/help-center', priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/term-of-use', priority: 0.5, changeFrequency: 'monthly' as const },
]

export function generateSitemap(baseUrl: string): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  SITEMAP_ROUTES.forEach(route => {
    sitemap.push({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })
  })

  LOCALES.forEach(locale => {
    if (locale === 'en') return
    SITEMAP_ROUTES.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      })
    })
  })

  return sitemap
}
