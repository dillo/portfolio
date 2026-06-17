import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://portfolio-xi-wine-28.vercel.app/sitemap.xml',
  }
}
