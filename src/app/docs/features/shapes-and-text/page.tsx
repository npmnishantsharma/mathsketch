import { DocsHeader } from '@/components/docs/DocsHeader'

export default function ShapesAndTextPage() {
  return (
    <div>
      <DocsHeader
        heading="Shapes & Text"
        text="Learn how to add shapes and text to your mathematical sketches."
      />

      <div className="container max-w-4xl py-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Available Shapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Basic Shapes</h3>
              <ul className="space-y-2">
                <li>Rectangle - Perfect for framing content</li>
                <li>Circle - Useful for points and sets</li>
                <li>Triangle - For geometric problems</li>
                <li>Line - Connect points or show relationships</li>
                <li>Arrow - Indicate direction or flow</li>
              </ul>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Shape Properties</h3>
              <ul className="space-y-2">
                <li>Resizable - Drag corners to adjust size</li>
                <li>Movable - Click and drag to reposition</li>
                <li>Customizable - Change color and stroke width</li>
                <li>Rotatable - Coming soon</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Text Tool</h2>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              The text tool allows you to add explanations, labels, and mathematical expressions to your sketches.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Text Features</h3>
              <ul className="space-y-2">
                <li>Multiple font styles and sizes</li>
                <li>Color customization</li>
                <li>Drag and drop positioning</li>
                <li>Math symbol support</li>
                <li>Multi-line text support</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Tips & Tricks</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Working with Shapes</h3>
              <ul className="space-y-2">
                <li>Hold Shift while drawing for perfect squares/circles</li>
                <li>Use the selection tool to modify existing shapes</li>
                <li>Double-click text to edit content</li>
                <li>Group shapes for complex diagrams (coming soon)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 