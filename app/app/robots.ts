import type { MetadataRoute } from 'next'
 
type Robots = {
  rules:
    | {
        userAgent?: string | string[]
        allow?: string | string[]
        disallow?: string | string[]
        crawlDelay?: number
      }
    | Array<{
        userAgent: string | string[]
        allow?: string | string[]
        disallow?: string | string[]
        crawlDelay?: number
      }>
  sitemap?: string | string[]
  host?: string
}


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