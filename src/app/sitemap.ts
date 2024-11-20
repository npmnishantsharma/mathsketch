import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mathsketch.nishantapps.in/',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://mathsketch.nishantapps.in/privacy',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: 'https://mathsketch.nishantapps.in/terma',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
  ]
}
