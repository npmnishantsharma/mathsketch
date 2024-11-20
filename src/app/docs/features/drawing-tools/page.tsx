import { DocsHeader } from '@/components/docs/DocsHeader'

export default function DrawingToolsPage() {
  return (
    <div>
      <DocsHeader
        heading="Drawing Tools"
        text="Learn about the various drawing tools available in MathSketch."
      />

      <div className="container max-w-4xl py-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Brush Tool</h2>
          <p className="text-lg text-muted-foreground mb-4">
            The brush tool is your primary instrument for writing and drawing. It provides smooth, pressure-sensitive strokes perfect for mathematical notation.
          </p>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adjustable brush size using the slider or +/- buttons</li>
              <li>Color picker for different ink colors</li>
              <li>Pressure sensitivity support for touch devices</li>
              <li>Hold Shift while drawing to create straight lines</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Eraser Tool</h2>
          <p className="text-lg text-muted-foreground mb-4">
            The eraser tool allows you to correct mistakes and modify your drawings with precision.
          </p>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adjustable eraser size for precise corrections</li>
              <li>Pressure-sensitive erasing on supported devices</li>
              <li>Hold Shift for straight-line erasing</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Tool Selection</h3>
              <ul className="space-y-2">
                <li><kbd className="px-2 py-1 bg-background rounded">B</kbd> - Brush tool</li>
                <li><kbd className="px-2 py-1 bg-background rounded">E</kbd> - Eraser tool</li>
                <li><kbd className="px-2 py-1 bg-background rounded">T</kbd> - Text tool</li>
              </ul>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Actions</h3>
              <ul className="space-y-2">
                <li><kbd className="px-2 py-1 bg-background rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-background rounded">Z</kbd> - Undo</li>
                <li><kbd className="px-2 py-1 bg-background rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-background rounded">Y</kbd> - Redo</li>
                <li><kbd className="px-2 py-1 bg-background rounded">Shift</kbd> + Drag - Straight lines</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 