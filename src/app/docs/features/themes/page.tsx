import { DocsHeader } from '@/components/docs/DocsHeader'

export default function ThemesPage() {
  return (
    <div>
      <DocsHeader
        heading="Themes"
        text="Customize the appearance of MathSketch with different themes."
      />

      <div className="container max-w-4xl py-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Built-in Themes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Dark Theme</h3>
              <p className="text-muted-foreground mb-2">
                A dark theme that's easy on the eyes, perfect for low-light environments.
              </p>
              <ul className="space-y-1">
                <li>Background: #1a1a1a</li>
                <li>Text: #FFFFFF</li>
                <li>Primary: #3B82F6</li>
                <li>Secondary: #6B7280</li>
              </ul>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Sepia Theme</h3>
              <p className="text-muted-foreground mb-2">
                A warm, paper-like theme that reduces eye strain.
              </p>
              <ul className="space-y-1">
                <li>Background: #F1E7D0</li>
                <li>Text: #433422</li>
                <li>Primary: #A0522D</li>
                <li>Secondary: #8B4513</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Custom Themes</h2>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Create your own themes by customizing colors and saving them for future use.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Customizable Properties</h3>
              <ul className="space-y-2">
                <li>Background color - The main canvas color</li>
                <li>Text color - Color for text and drawings</li>
                <li>Primary color - Used for buttons and accents</li>
                <li>Secondary color - Used for subtle elements</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Theme Management</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2">
                <li>Save custom themes</li>
                <li>Switch between themes instantly</li>
                <li>Theme persistence across sessions</li>
                <li>Share themes with other users (coming soon)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 