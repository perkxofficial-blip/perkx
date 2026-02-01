import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.FRONTEND_URL
  
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/', '/user/'],
      },
      {
        userAgent: ['Applebot', 'Bingbot'],
        allow: ['/'],
        disallow: ['/admin/', '/user/'],
      },
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin/', '/user/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}