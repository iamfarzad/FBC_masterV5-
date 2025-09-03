import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

const modules = [
  {
    id: 1,
    title: 'Introduction',
    description: 'Get started with F.B/c platform fundamentals',
    duration: '10 min',
    status: 'available'
  },
  {
    id: 2,
    title: 'Advanced Features',
    description: 'Explore advanced capabilities and integrations',
    duration: '15 min',
    status: 'available'
  },
  {
    id: 3,
    title: 'Best Practices',
    description: 'Learn optimal usage patterns and workflows',
    duration: '20 min',
    status: 'available'
  }
]

export default function WorkshopPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Workshop</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Learn and explore platform capabilities
          </p>
        </div>

        <div className="grid gap-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {module.duration}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Start Module
                  <ArrowRight className="h-4 w-4" />
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