import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tools = [
  {
    id: 'calculator',
    title: 'ROI Calculator',
    description: 'Calculate return on investment with detailed analysis'
  },
  {
    id: 'analyzer',
    title: 'Data Analyzer',
    description: 'Process and visualize complex data sets'
  },
  {
    id: 'converter',
    title: 'Format Converter',
    description: 'Convert between different data formats'
  },
  {
    id: 'validator',
    title: 'Schema Validator',
    description: 'Validate data against defined schemas'
  }
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Tools</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Productivity tools and utilities
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}