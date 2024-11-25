import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const quizSnapshot = await getDocs(collection(db, 'quizzes'))
  
  const quizUrls = quizSnapshot.docs.map(quiz => ({
    url: `https://mathsketch.nishantapps.in/question/${quiz.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const staticUrls = [
    {
      url: 'https://mathsketch.nishantapps.in/',
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: 'https://mathsketch.nishantapps.in/privacy',
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.9,
    },
    {
      url: 'https://mathsketch.nishantapps.in/terms',
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.8,
    },
  ]

  return [...staticUrls, ...quizUrls]
}
