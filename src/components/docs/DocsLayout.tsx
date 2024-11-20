import { DocsSidebar } from './DocsSidebar'
import { ScrollArea } from '../ui/scroll-area'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DocsSidebar className="hidden lg:block w-72 shrink-0 border-r" />
      <ScrollArea className="flex-1">
        <main>{children}</main>
      </ScrollArea>
    </div>
  )
} 