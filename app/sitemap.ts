import type { MetadataRoute } from 'next'
import { series } from '@/lib/guides'

const BASE_URL = 'https://portfolio-xi-wine-28.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes: MetadataRoute.Sitemap = series.flatMap((s) => [
    {
      url: `${BASE_URL}/guides/${s.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...s.lessons.map((l) => ({
      url: `${BASE_URL}/guides/${s.id}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ])

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...guideRoutes,
  ]
}
