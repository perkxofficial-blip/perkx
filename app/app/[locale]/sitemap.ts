import { generateSitemap } from '../utils/sitemap'

export default function sitemap() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  return generateSitemap(baseUrl)
}
