import { generateSitemap } from './utils/sitemapUtils'

export default function sitemap() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  return generateSitemap(baseUrl)
}