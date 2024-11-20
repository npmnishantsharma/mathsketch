import { cn } from "@/lib/utils"
import Image from "next/image"

interface DocsHeaderProps {
  heading: string
  text?: string
  pattern?: boolean
}

export function DocsHeader({ heading, text, pattern = true }: DocsHeaderProps) {
  return (
    <div className={cn(
      "relative py-8 md:py-12",
      pattern && "bg-grid-pattern"
    )}>
      <div className="container max-w-5xl relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <Image
            src="/logo.png"
            alt="MathSketch Logo"
            width={48}
            height={48}
            className="rounded-lg shadow-lg"
          />
          <div className="h-8 w-[2px] bg-gradient-to-b from-primary/60 to-primary" />
          <span className="text-sm font-medium text-muted-foreground">Documentation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {heading}
        </h1>
        {text && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            {text}
          </p>
        )}
      </div>
      {pattern && (
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  )
} 