import { DocsHeader } from '@/components/docs/DocsHeader'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lightbulb, Share2, Sparkles } from 'lucide-react'

export default function DocsPage() {
  return (
    <div>
      <DocsHeader
        heading="Documentation"
        text="Welcome to MathSketch documentation. Learn how to use MathSketch effectively."
      />

      <div className="container max-w-5xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/docs/getting-started">
            <Card className="p-6 group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Getting Started
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Learn the basics of MathSketch and how to get started with your first mathematical sketch.
                  </p>
                  <div className="flex items-center text-sm text-primary">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/docs/features">
            <Card className="p-6 group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Features
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Explore all the features MathSketch offers for mathematical problem-solving.
                  </p>
                  <div className="flex items-center text-sm text-primary">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/docs/collaboration">
            <Card className="p-6 group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Share2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Collaboration
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Learn how to collaborate with others in real-time using MathSketch.
                  </p>
                  <div className="flex items-center text-sm text-primary">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/docs/ai-features">
            <Card className="p-6 group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    AI Features
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Discover how MathSketch's AI can help you solve mathematical problems.
                  </p>
                  <div className="flex items-center text-sm text-primary">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 