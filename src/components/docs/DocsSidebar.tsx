"use client"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface DocsSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DocsSidebar({ className, ...props }: DocsSidebarProps) {
  const pathname = usePathname()
  
  const items = [
    {
      title: "Getting Started",
      items: [
        { title: "Introduction", href: "/docs/getting-started" },
        { title: "Installation", href: "/docs/getting-started/installation" },
        { title: "Quick Start", href: "/docs/getting-started/quick-start" },
      ],
    },
    {
      title: "Features",
      items: [
        { title: "Drawing Tools", href: "/docs/features/drawing-tools" },
        { title: "Math Keyboard", href: "/docs/features/math-keyboard" },
        { title: "Shapes & Text", href: "/docs/features/shapes-and-text" },
        { title: "Themes", href: "/docs/features/themes" },
      ],
    },
    {
      title: "Collaboration",
      items: [
        { title: "Real-time Drawing", href: "/docs/collaboration/real-time-drawing" },
        { title: "Chat", href: "/docs/collaboration/chat" },
        { title: "Sharing", href: "/docs/collaboration/sharing" },
      ],
    },
    {
      title: "AI Features",
      items: [
        { title: "Problem Solving", href: "/docs/ai-features/problem-solving" },
        { title: "Practice Questions", href: "/docs/ai-features/practice-questions" },
        { title: "Quizzes", href: "/docs/ai-features/quizzes" },
      ],
    },
  ]

  return (
    <div className={cn("pb-12 bg-muted/30", className)} {...props}>
      <div className="py-4">
        <div className="px-4 py-2">
          <Link href="/" className="flex items-center gap-2 mb-8 px-4">
            <Image
              src="/logo.png"
              alt="MathSketch Logo"
              width={32}
              height={32}
              className="rounded-lg shadow-md"
            />
            <div className="font-semibold">MathSketch</div>
          </Link>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-4">
              {items.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="px-4 text-sm font-medium text-muted-foreground">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Button
                        key={item.href}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start px-4",
                          pathname === item.href && "bg-primary/10 text-primary"
                        )}
                        asChild
                      >
                        <Link href={item.href}>{item.title}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
} 