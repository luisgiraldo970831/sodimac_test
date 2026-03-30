import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/articles'

const BASE_URL = 'https://patitas.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs()

  const articleUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/articulos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: `${BASE_URL}/articulos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...articleUrls,
  ]
}

