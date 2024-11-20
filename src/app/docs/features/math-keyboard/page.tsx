import { DocsHeader } from '@/components/docs/DocsHeader'

export default function MathKeyboardPage() {
  return (
    <div>
      <DocsHeader
        heading="Math Keyboard"
        text="Use the specialized math keyboard to input mathematical symbols and expressions."
      />

      <div className="container max-w-4xl py-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground mb-4">
            The math keyboard provides quick access to common mathematical symbols, operators, and expressions, making it easier to write complex mathematical notation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Available Symbols</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Basic Math</h3>
              <ul className="space-y-2">
                <li>± Plus/Minus</li>
                <li>× Multiplication</li>
                <li>÷ Division</li>
                <li>√ Square Root</li>
              </ul>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Greek Letters</h3>
              <ul className="space-y-2">
                <li>α Alpha</li>
                <li>β Beta</li>
                <li>π Pi</li>
                <li>θ Theta</li>
              </ul>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Calculus</h3>
              <ul className="space-y-2">
                <li>∫ Integral</li>
                <li>∂ Partial</li>
                <li>Σ Sum</li>
                <li>∞ Infinity</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Using the Keyboard</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              1. Click the keyboard icon in the toolbar to open the math keyboard
            </p>
            <p className="text-muted-foreground">
              2. Select a text box or create a new one to start typing
            </p>
            <p className="text-muted-foreground">
              3. Click symbols to insert them into your text
            </p>
            <p className="text-muted-foreground">
              4. Use the category tabs to find specific symbols
            </p>
          </div>
        </section>
      </div>
    </div>
  )
} 