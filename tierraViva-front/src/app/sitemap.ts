import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tierraviva.com.mx'
  
  // Basic static routes
  const routes = [
    '',
    '/about',
    '/animals',
    '/shop',
    '/blog',
    '/gallery',
    '/newsletter',
    '/updates',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
