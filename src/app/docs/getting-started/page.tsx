import { DocsHeader } from '@/components/docs/DocsHeader'
import { Card } from '@/components/ui/card'

export default function GettingStartedPage() {
  return (
    <div className="container max-w-4xl py-6 md:py-12">
      <DocsHeader
        heading="Introduction"
        text="Learn about MathSketch and how it can help you with mathematical problem-solving."
      />

      <div className="space-y-8 pt-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What is MathSketch?</h2>
          <p className="text-lg text-muted-foreground">
            MathSketch is an innovative web application that combines the power of AI with intuitive drawing tools to help users solve mathematical problems. Whether you're a student, teacher, or professional, MathSketch provides the tools you need to visualize and solve mathematical concepts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-bold mb-2">AI-Powered Problem Solving</h3>
              <p>Get step-by-step solutions and explanations for your mathematical problems.</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold mb-2">Real-time Collaboration</h3>
              <p>Work together with others in real-time on mathematical problems.</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold mb-2">Interactive Drawing Tools</h3>
              <p>Use intuitive drawing tools to sketch mathematical diagrams and equations.</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold mb-2">Practice & Learning</h3>
              <p>Access practice questions and quizzes to reinforce your understanding.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
} 