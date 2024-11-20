import { Metadata } from 'next'
import { DocsLayout } from '@/components/docs/DocsLayout'
import '@/styles/docs.css'

export const metadata: Metadata = {
  title: 'MathSketch Documentation',
  description: 'Learn how to use MathSketch effectively for mathematical problem-solving and collaboration.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>
} 